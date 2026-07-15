import { supabase, isSupabaseConfigured } from "../lib/supabase";

export type UserRole = "guest" | "user" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  petName?: string;
  petType?: string;
  petAge?: string;
  createdAt: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

export interface AuthResponse {
  user: AuthUser | null;
  session: AuthSession | null;
  error: string | null;
}

const MOCK_USERS_KEY = "petcare_mock_users";
const MOCK_SESSION_KEY = "petcare_mock_session";

// Let's seed an initial admin/host user to make evaluation and playtesting effortless.
const INITIAL_MOCK_USERS: AuthUser[] = [
  {
    id: "mock-admin-id",
    email: "lilymitslal@gmail.com",
    fullName: "Lily Mits",
    role: "admin",
    petName: "Biscuit",
    petType: "Dog",
    petAge: "Puppy",
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-user-id",
    email: "petparent@example.com",
    fullName: "Clara Vance",
    role: "user",
    petName: "Luna",
    petType: "Cat",
    petAge: "Kitten",
    createdAt: new Date().toISOString(),
  }
];

// Helper to get local mock users
function getMockUsers(): (AuthUser & { password?: string })[] {
  const data = localStorage.getItem(MOCK_USERS_KEY);
  if (!data) {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(INITIAL_MOCK_USERS));
    return INITIAL_MOCK_USERS;
  }
  return JSON.parse(data);
}

// Helper to save local mock users
function saveMockUsers(users: any[]) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

export const authService = {
  isRealSupabase(): boolean {
    return isSupabaseConfigured;
  },

  async signUp(
    email: string,
    password: string,
    fullName: string,
    role: UserRole = "user",
    petDetails?: { petName?: string; petType?: string; petAge?: string }
  ): Promise<AuthResponse> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              fullName,
              role,
              ...petDetails,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.fullName || fullName,
            role: (data.user.user_metadata?.role as UserRole) || role,
            petName: data.user.user_metadata?.petName,
            petType: data.user.user_metadata?.petType,
            petAge: data.user.user_metadata?.petAge,
            createdAt: data.user.created_at,
          };

          const session: AuthSession | null = data.session
            ? {
                user: authUser,
                token: data.session.access_token,
                expiresAt: Date.now() + (data.session.expires_in || 3600) * 1000,
              }
            : null;

          return { user: authUser, session, error: null };
        }

        return { user: null, session: null, error: "Verification email sent. Please check your inbox." };
      } catch (err: any) {
        return { user: null, session: null, error: err.message || "Sign up failed" };
      }
    } else {
      // High-fidelity sandbox implementation
      await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate network latency

      const users = getMockUsers();
      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { user: null, session: null, error: "A user with this email already exists." };
      }

      const newUser: AuthUser & { password?: string } = {
        id: `usr-${Date.now()}`,
        email: email.toLowerCase(),
        fullName,
        role,
        ...petDetails,
        createdAt: new Date().toISOString(),
        password, // stored locally in plaintext for simulation purposes only
      };

      users.push(newUser);
      saveMockUsers(users);

      const cleanUser: AuthUser = { ...newUser };
      delete (cleanUser as any).password;

      const mockSession: AuthSession = {
        user: cleanUser,
        token: `mock-token-${Date.now()}`,
        expiresAt: Date.now() + 3600 * 1000,
      };

      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockSession));

      return { user: cleanUser, session: mockSession, error: null };
    }
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.fullName || "Active User",
            role: (data.user.user_metadata?.role as UserRole) || "user",
            petName: data.user.user_metadata?.petName,
            petType: data.user.user_metadata?.petType,
            petAge: data.user.user_metadata?.petAge,
            createdAt: data.user.created_at,
          };

          const session: AuthSession = {
            user: authUser,
            token: data.session.access_token,
            expiresAt: Date.now() + data.session.expires_in * 1000,
          };

          return { user: authUser, session, error: null };
        }

        return { user: null, session: null, error: "Unexpected response formatting" };
      } catch (err: any) {
        return { user: null, session: null, error: err.message || "Invalid credentials" };
      }
    } else {
      // Sandbox implementation
      await new Promise((resolve) => setTimeout(resolve, 500));

      const users = getMockUsers();
      const matched = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && (!u.password || u.password === password)
      );

      if (!matched) {
        return { user: null, session: null, error: "Invalid email or password." };
      }

      const cleanUser: AuthUser = { ...matched };
      delete (cleanUser as any).password;

      const mockSession: AuthSession = {
        user: cleanUser,
        token: `mock-token-${Date.now()}`,
        expiresAt: Date.now() + 3600 * 1000,
      };

      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockSession));

      return { user: cleanUser, session: mockSession, error: null };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { error: null };
      } catch (err: any) {
        return { error: err.message || "Logout failed" };
      }
    } else {
      localStorage.removeItem(MOCK_SESSION_KEY);
      return { error: null };
    }
  },

  async forgotPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) throw error;
        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err.message || "Failed to send reset email" };
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const users = getMockUsers();
      const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!matched) {
        return { success: false, error: "No account found with this email." };
      }
      return { success: true, error: null };
    }
  },

  async resetPassword(password: string): Promise<{ success: boolean; error: string | null }> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err.message || "Failed to reset password" };
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const sessionData = localStorage.getItem(MOCK_SESSION_KEY);
      if (!sessionData) {
        return { success: false, error: "No active session to perform password reset." };
      }
      const session = JSON.parse(sessionData) as AuthSession;
      const users = getMockUsers();
      const index = users.findIndex((u) => u.id === session.user.id);
      if (index !== -1) {
        users[index].password = password;
        saveMockUsers(users);
        return { success: true, error: null };
      }
      return { success: false, error: "User session expired or invalid." };
    }
  },

  async getCurrentSession(): Promise<AuthSession | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) return null;

        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || "",
          fullName: session.user.user_metadata?.fullName || "Active User",
          role: (session.user.user_metadata?.role as UserRole) || "user",
          petName: session.user.user_metadata?.petName,
          petType: session.user.user_metadata?.petType,
          petAge: session.user.user_metadata?.petAge,
          createdAt: session.user.created_at,
        };

        return {
          user: authUser,
          token: session.access_token,
          expiresAt: Date.now() + session.expires_in * 1000,
        };
      } catch {
        return null;
      }
    } else {
      const data = localStorage.getItem(MOCK_SESSION_KEY);
      if (!data) return null;
      const session = JSON.parse(data) as AuthSession;
      if (session.expiresAt < Date.now()) {
        localStorage.removeItem(MOCK_SESSION_KEY);
        return null;
      }
      return session;
    }
  },

  // Facilitates testing role changes in local UI sandbox without requiring database re-seeding
  async updateMockUserRole(userId: string, role: UserRole): Promise<AuthUser | null> {
    if (isSupabaseConfigured) {
      // In real supabase we can update metadata on current user
      if (supabase) {
        const { data, error } = await supabase.auth.updateUser({
          data: { role }
        });
        if (!error && data.user) {
          return {
            id: data.user.id,
            email: data.user.email || "",
            fullName: data.user.user_metadata?.fullName || "",
            role: (data.user.user_metadata?.role as UserRole) || role,
            createdAt: data.user.created_at
          };
        }
      }
      return null;
    } else {
      const users = getMockUsers();
      const index = users.findIndex((u) => u.id === userId);
      if (index !== -1) {
        users[index].role = role;
        saveMockUsers(users);
        const updatedUser = { ...users[index] };
        delete (updatedUser as any).password;

        // Also update current session if active
        const sessionData = localStorage.getItem(MOCK_SESSION_KEY);
        if (sessionData) {
          const session = JSON.parse(sessionData) as AuthSession;
          if (session.user.id === userId) {
            session.user.role = role;
            localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
          }
        }

        return updatedUser;
      }
      return null;
    }
  }
};
