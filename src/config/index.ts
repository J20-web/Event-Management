export const API_BASE_URL = "/api";

export const API_ROUTES = {
  EVENTS: `${API_BASE_URL}/events`,
  EVENT_BY_ID: (id: string) => `${API_BASE_URL}/events/${id}`,
  REGISTER: (eventId: string) => `${API_BASE_URL}/events/${eventId}/register`,
  COMMENTS: (eventId: string) => `${API_BASE_URL}/events/${eventId}/comments`,
  TOGGLE_CHECKIN: (eventId: string, regId: string) => `${API_BASE_URL}/events/${eventId}/registrations/${regId}/checkin`,
  REMOVE_REGISTRATION: (eventId: string, regId: string) => `${API_BASE_URL}/events/${eventId}/registrations/${regId}`,
  GENERATE_EVENT: `${API_BASE_URL}/ai/generate-event`,
  ASK_EXPERT: `${API_BASE_URL}/ai/ask-expert`,
};

export const LOCAL_STORAGE_KEYS = {
  USER_REGISTRATIONS: "pet_care_user_regs",
};
