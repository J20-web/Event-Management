import { PetEvent, Comment } from "../types";
import { API_ROUTES } from "../config";

/**
 * Helper to dynamically extract the active JWT auth token (Supabase or Local Sandbox)
 * and bundle it into standard Bearer authorization headers.
 */
function getAuthHeaders(contentTypeJson = true): Record<string, string> {
  const headers: Record<string, string> = {};
  if (contentTypeJson) {
    headers["Content-Type"] = "application/json";
  }

  // 1. Try to extract from standard Supabase localStorage persist format
  try {
    const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
    if (supabaseUrl && supabaseUrl !== "MY_SUPABASE_URL") {
      const hostname = new URL(supabaseUrl).hostname;
      // Supabase storage format key: sb-<project-ref>-auth-token
      const projectRef = hostname.split(".")[0];
      const storageKey = `sb-${projectRef}-auth-token`;
      const sbSessionRaw = localStorage.getItem(storageKey);
      if (sbSessionRaw) {
        const sbSession = JSON.parse(sbSessionRaw);
        if (sbSession?.access_token) {
          headers["Authorization"] = `Bearer ${sbSession.access_token}`;
          return headers;
        }
      }
    }
  } catch (err) {
    console.warn("Could not parse Supabase persist storage token:", err);
  }

  // 2. Try to extract from our high-fidelity local sandbox state session
  try {
    const mockSessionRaw = localStorage.getItem("petcare_mock_session");
    if (mockSessionRaw) {
      const mockSession = JSON.parse(mockSessionRaw);
      if (mockSession?.token) {
        headers["Authorization"] = `Bearer ${mockSession.token}`;
        return headers;
      }
    }
  } catch (err) {
    console.warn("Could not parse Sandbox mock session storage token:", err);
  }

  return headers;
}

export const eventService = {
  /**
   * Fetches all events with optional filters
   */
  async fetchEvents(filters?: { search?: string; category?: string; petType?: string }): Promise<PetEvent[]> {
    const url = new URL(window.location.origin + API_ROUTES.EVENTS);
    if (filters) {
      if (filters.search) url.searchParams.append("search", filters.search);
      if (filters.category) url.searchParams.append("category", filters.category);
      if (filters.petType) url.searchParams.append("petType", filters.petType);
    }

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(false),
    });
    if (!response.ok) {
      throw new Error("Could not connect to event catalog.");
    }
    return response.json();
  },

  /**
   * Fetches a single event by ID
   */
  async getEventById(id: string): Promise<PetEvent> {
    const response = await fetch(API_ROUTES.EVENT_BY_ID(id), {
      headers: getAuthHeaders(false),
    });
    if (!response.ok) {
      throw new Error("Event not found");
    }
    return response.json();
  },

  /**
   * Creates a new event (Hosts)
   */
  async createEvent(eventData: any): Promise<PetEvent> {
    const response = await fetch(API_ROUTES.EVENTS, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to publish event.");
    }

    return response.json();
  },

  /**
   * Deletes an event
   */
  async deleteEvent(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(API_ROUTES.EVENT_BY_ID(id), {
      method: "DELETE",
      headers: getAuthHeaders(false),
    });

    if (!response.ok) {
      throw new Error("Could not delete this event.");
    }

    return response.json();
  },

  /**
   * Registers a user for an event
   */
  async registerForEvent(eventId: string, registrationData: any): Promise<any> {
    const response = await fetch(API_ROUTES.REGISTER(eventId), {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(registrationData),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to register.");
    }

    return response.json();
  },

  /**
   * Adds a comment to an event
   */
  async addCommentToEvent(eventId: string, commentData: { name: string; role: string; text: string }): Promise<Comment> {
    const response = await fetch(API_ROUTES.COMMENTS(eventId), {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Could not post comment.");
    }

    return response.json();
  },

  /**
   * Toggles check-in status for an attendee (Host utility)
   */
  async toggleCheckIn(eventId: string, regId: string): Promise<any> {
    const response = await fetch(API_ROUTES.TOGGLE_CHECKIN(eventId, regId), {
      method: "POST",
      headers: getAuthHeaders(false),
    });

    if (!response.ok) {
      throw new Error("Failed to change check-in status.");
    }

    return response.json();
  },

  /**
   * Cancels a seat / removes registration (Host utility)
   */
  async removeRegistration(eventId: string, regId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(API_ROUTES.REMOVE_REGISTRATION(eventId, regId), {
      method: "DELETE",
      headers: getAuthHeaders(false),
    });

    if (!response.ok) {
      throw new Error("Failed to remove attendee seat.");
    }

    return response.json();
  },

  /**
   * Generates a new event details using Gemini AI
   */
  async generateEventWithAI(idea: string, petType: string): Promise<any> {
    const response = await fetch(API_ROUTES.GENERATE_EVENT, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ idea, petType }),
    });

    if (!response.ok) {
      throw new Error("Gemini AI failed to design the event structure.");
    }

    return response.json();
  },

  /**
   * Asks the AI Expert Co-Host a question
   */
  async askAiExpert(eventId: string, message: string, chatHistory: any[]): Promise<{ text: string }> {
    const response = await fetch(API_ROUTES.ASK_EXPERT, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ eventId, message, chatHistory }),
    });

    if (!response.ok) {
      throw new Error("Failed to communicate with AI Expert.");
    }

    return response.json();
  }
};
