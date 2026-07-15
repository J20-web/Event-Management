import { useState, useEffect, useCallback } from "react";
import { PetEvent, Comment } from "../types";
import { eventService } from "../services/eventService";
import { LOCAL_STORAGE_KEYS } from "../config";

export function useEvents() {
  const [events, setEvents] = useState<PetEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<PetEvent | null>(null);
  const [roleView, setRoleView] = useState<"attendee" | "host">("attendee");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  // Track local user registrations (Simulates single authenticated user)
  const [localRegisteredEventIds, setLocalRegisteredEventIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_REGISTRATIONS);
      return saved ? JSON.parse(saved) : { "evt-1": true }; // Pre-registered for first aid by default
    } catch {
      return { "evt-1": true };
    }
  });

  // Fetch all events from API & refresh active selected event
  const fetchEvents = useCallback(async () => {
    try {
      setErrorText("");
      const data = await eventService.fetchEvents();
      setEvents(data);

      // Refresh the active selected event if one is chosen
      if (selectedEvent) {
        const updated = data.find((e) => e.id === selectedEvent.id);
        if (updated) {
          setSelectedEvent(updated);
        }
      }
    } catch (err: any) {
      console.error("Fetch events failed:", err);
      setErrorText("The server is starting up or unreachable. Please wait as we build your database context...");
    } finally {
      setIsLoading(false);
    }
  }, [selectedEvent]);

  // Initial load
  useEffect(() => {
    fetchEvents();
  }, []);

  // Save registration status locally
  const saveUserRegistration = useCallback((eventId: string) => {
    setLocalRegisteredEventIds((prev) => {
      const updated = { ...prev, [eventId]: true };
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER_REGISTRATIONS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Host Action: Create event
  const createEvent = useCallback(async (newEventData: any) => {
    await eventService.createEvent(newEventData);
    await fetchEvents();
  }, [fetchEvents]);

  // Host Action: Delete event
  const deleteEvent = useCallback(async (id: string) => {
    await eventService.deleteEvent(id);
    if (selectedEvent?.id === id) {
      setSelectedEvent(null);
    }
    await fetchEvents();
  }, [selectedEvent, fetchEvents]);

  // Attendee Action: Register for event
  const registerForEvent = useCallback(async (formData: any) => {
    if (!selectedEvent) return;

    await eventService.registerForEvent(selectedEvent.id, formData);
    saveUserRegistration(selectedEvent.id);
    await fetchEvents();
  }, [selectedEvent, saveUserRegistration, fetchEvents]);

  // Attendee/Host Action: Post public comment
  const addComment = useCallback(async (text: string, name: string, role: string): Promise<Comment> => {
    if (!selectedEvent) throw new Error("No active event selected.");

    const comment = await eventService.addCommentToEvent(selectedEvent.id, { name, role, text });
    await fetchEvents();
    return comment;
  }, [selectedEvent, fetchEvents]);

  // Host Action: Toggle attendee check-in
  const toggleCheckIn = useCallback(async (eventId: string, regId: string) => {
    await eventService.toggleCheckIn(eventId, regId);
    await fetchEvents();
  }, [fetchEvents]);

  // Host Action: Cancel seat / remove attendee
  const removeRegistration = useCallback(async (eventId: string, regId: string) => {
    await eventService.removeRegistration(eventId, regId);
    await fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    selectedEvent,
    setSelectedEvent,
    roleView,
    setRoleView,
    isRegisterModalOpen,
    setIsRegisterModalOpen,
    localRegisteredEventIds,
    isLoading,
    setIsLoading,
    errorText,
    fetchEvents,
    createEvent,
    deleteEvent,
    registerForEvent,
    addComment,
    toggleCheckIn,
    removeRegistration,
  };
}
