import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { authService, AuthUser, AuthSession, UserRole, AuthResponse } from "../services/authService";

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  role: UserRole;
  isLoading: boolean;
  error: string | null;
  isSandbox: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role?: UserRole,
    petDetails?: { petName?: string; petType?: string; petAge?: string }
  ) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: string | null }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error: string | null }>;
  resetPassword: (password: string) => Promise<{ success: boolean; error: string | null }>;
  changeRole: (role: UserRole) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isSandbox = !authService.isRealSupabase();

  // Load persistent session on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const activeSession = await authService.getCurrentSession();
        if (activeSession) {
          setSession(activeSession);
          setUser(activeSession.user);
        }
      } catch (err: any) {
        console.error("Failed to restore auth session:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.signIn(email, password);
      if (res.error) {
        setError(res.error);
      } else {
        setSession(res.session);
        setUser(res.user);
      }
      return res;
    } catch (err: any) {
      const errorMsg = err.message || "An unexpected login error occurred.";
      setError(errorMsg);
      return { user: null, session: null, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      role: UserRole = "user",
      petDetails?: { petName?: string; petType?: string; petAge?: string }
    ): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await authService.signUp(email, password, fullName, role, petDetails);
        if (res.error) {
          setError(res.error);
        } else if (res.session) {
          setSession(res.session);
          setUser(res.user);
        }
        return res;
      } catch (err: any) {
        const errorMsg = err.message || "An unexpected sign-up error occurred.";
        setError(errorMsg);
        return { user: null, session: null, error: errorMsg };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async (): Promise<{ error: string | null }> => {
    setIsLoading(true);
    try {
      const res = await authService.signOut();
      if (!res.error) {
        setSession(null);
        setUser(null);
      } else {
        setError(res.error);
      }
      return res;
    } catch (err: any) {
      const errorMsg = err.message || "Failed to sign out correctly.";
      setError(errorMsg);
      return { error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<{ success: boolean; error: string | null }> => {
    setError(null);
    try {
      return await authService.forgotPassword(email);
    } catch (err: any) {
      return { success: false, error: err.message || "Reset request failed." };
    }
  }, []);

  const resetPassword = useCallback(async (password: string): Promise<{ success: boolean; error: string | null }> => {
    setError(null);
    try {
      return await authService.resetPassword(password);
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update password." };
    }
  }, []);

  const changeRole = useCallback(async (newRole: UserRole): Promise<boolean> => {
    if (!user) return false;
    try {
      const updatedUser = await authService.updateMockUserRole(user.id, newRole);
      if (updatedUser) {
        setUser(updatedUser);
        if (session) {
          setSession({
            ...session,
            user: updatedUser,
          });
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to update user role:", err);
      return false;
    }
  }, [user, session]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const role: UserRole = user ? user.role : "guest";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isLoading,
        error,
        isSandbox,
        signIn,
        signUp,
        signOut,
        forgotPassword,
        resetPassword,
        changeRole,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
