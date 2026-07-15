import React, { useState, useMemo } from "react";
import {
  PlusCircle,
  Sparkles,
  Loader2,
  Trash2,
  CheckCircle,
  FileSpreadsheet,
  Users,
  AlertTriangle,
  Award
} from "lucide-react";
import { PetEvent } from "../../../types";
import { eventService } from "../../../services/eventService";
import { validateLength, validateDate, validateCapacity, validateUrl, sanitizeInput } from "../../../utils/validation";

interface HostDashboardProps {
  events: PetEvent[];
  onCreateEvent: (newEventData: any) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  onToggleCheckIn: (eventId: string, regId: string) => Promise<void>;
  onRemoveRegistration: (eventId: string, regId: string) => Promise<void>;
}

export default function HostDashboard({
  events,
  onCreateEvent,
  onDeleteEvent,
  onToggleCheckIn,
  onRemoveRegistration,
}: HostDashboardProps) {
  // Tabs for the Dashboard itself
  const [dashboardTab, setDashboardTab] = useState<"manifest" | "create">("manifest");

  // Selection states
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || "");
  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || events[0];
  }, [events, selectedEventId]);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    category: "Nutrition",
    petType: "Dogs",
    date: "",
    time: "",
    duration: "1.5 Hours",
    locationType: "online" as "online" | "in-person" | "hybrid",
    location: "",
    hostName: "Dr. Lily Mits, DVM",
    hostRole: "Veterinary Specialist",
    hostBio: "Graduate of UC Davis School of Veterinary Medicine, focused on active community-aligned proactive health seminars.",
    description: "",
    details: "",
    image: "",
    capacity: 100,
    tagsText: "Nutrition, Health, Care",
    agendaText: "",
    aiPetTipsText: "",
  });

  // AI Generator States
  const [aiIdea, setAiIdea] = useState("");
  const [aiPetTypeFocus, setAiPetTypeFocus] = useState("Cats");
  const [isAiPlanning, setIsAiPlanning] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState("");
  const [csvPreview, setCsvPreview] = useState<string | null>(null);

  // Loading/Error states
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle AI Event Generation using our event service
  const handleAiGenerate = async () => {
    if (!aiIdea.trim()) {
      setErrorMessage("Please enter an event idea for the AI planner.");
      return;
    }

    setIsAiPlanning(true);
    setErrorMessage("");
    setAiSuccessMessage("");

    try {
      const data = await eventService.generateEventWithAI(aiIdea, aiPetTypeFocus);

      // Format agenda for standard text editing (one per line)
      const formattedAgenda = data.agenda
        ? data.agenda.map((a: any) => `${a.time} | ${a.title} | ${a.description}`).join("\n")
        : "";

      // Format tips for standard text editing (one per line)
      const formattedTips = data.aiPetTips ? data.aiPetTips.join("\n") : "";

      // Populate form
      setFormData((prev) => ({
        ...prev,
        title: data.title,
        category: data.category,
        petType: data.petType,
        duration: data.duration,
        description: data.description,
        details: data.details,
        hostName: data.hostName,
        hostRole: data.hostRole,
        hostBio: data.hostBio,
        tagsText: data.tags ? data.tags.join(", ") : "Syllabus Draft",
        agendaText: formattedAgenda,
        aiPetTipsText: formattedTips,
        image: data.image || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1200&auto=format&fit=crop&q=80",
      }));

      setAiSuccessMessage("✨ Gemini has drafted this event details, host bio, tags, schedule timeline, and safety tips! Review and finalize below.");
      setDashboardTab("create");
    } catch (err: any) {
      setErrorMessage(err.message || "Could not generate event details.");
    } finally {
      setIsAiPlanning(false);
    }
  };

  // Publish Event submit
  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Sanitization
    const cleanTitle = sanitizeInput(formData.title);
    const cleanCategory = sanitizeInput(formData.category);
    const cleanPetType = sanitizeInput(formData.petType);
    const cleanDate = sanitizeInput(formData.date);
    const cleanTime = sanitizeInput(formData.time);
    const cleanDuration = sanitizeInput(formData.duration);
    const cleanLocation = sanitizeInput(formData.location);
    const cleanHostName = sanitizeInput(formData.hostName);
    const cleanHostRole = sanitizeInput(formData.hostRole);
    const cleanHostBio = sanitizeInput(formData.hostBio);
    const cleanDescription = sanitizeInput(formData.description);
    const cleanDetails = sanitizeInput(formData.details || formData.description, "markdown");
    const cleanImage = sanitizeInput(formData.image);

    // Validation
    const titleErr = validateLength(cleanTitle, "Event Title", 5, 150);
    if (titleErr) {
      setErrorMessage(titleErr);
      return;
    }

    const categoryErr = validateLength(cleanCategory, "Category", 2, 50);
    if (categoryErr) {
      setErrorMessage(categoryErr);
      return;
    }

    const petTypeErr = validateLength(cleanPetType, "Pet Target Type", 2, 50);
    if (petTypeErr) {
      setErrorMessage(petTypeErr);
      return;
    }

    const dateErr = validateDate(cleanDate, false);
    if (dateErr) {
      setErrorMessage(dateErr);
      return;
    }

    const timeErr = validateLength(cleanTime, "Event Time", 2, 50);
    if (timeErr) {
      setErrorMessage(timeErr);
      return;
    }

    const durationErr = validateLength(cleanDuration, "Duration", 2, 50);
    if (durationErr) {
      setErrorMessage(durationErr);
      return;
    }

    const locationErr = validateLength(cleanLocation || (formData.locationType === "online" ? "Online" : ""), "Location details", formData.locationType === "online" ? 0 : 3, 250);
    if (locationErr) {
      setErrorMessage(locationErr);
      return;
    }

    const hostNameErr = validateLength(cleanHostName, "Host Name", 3, 100);
    if (hostNameErr) {
      setErrorMessage(hostNameErr);
      return;
    }

    const hostRoleErr = validateLength(cleanHostRole, "Host Professional Role", 2, 100);
    if (hostRoleErr) {
      setErrorMessage(hostRoleErr);
      return;
    }

    const hostBioErr = validateLength(cleanHostBio, "Host Professional Bio", 5, 1000);
    if (hostBioErr) {
      setErrorMessage(hostBioErr);
      return;
    }

    const descErr = validateLength(cleanDescription, "Overview Description", 10, 300);
    if (descErr) {
      setErrorMessage(descErr);
      return;
    }

    const detailsErr = validateLength(cleanDetails, "Detailed Syllabus Curriculum", 10, 8000);
    if (detailsErr) {
      setErrorMessage(detailsErr);
      return;
    }

    const capacityErr = validateCapacity(formData.capacity);
    if (capacityErr) {
      setErrorMessage(capacityErr);
      return;
    }

    if (cleanImage) {
      const imgErr = validateUrl(cleanImage, "Hero Banner Image URL", false);
      if (imgErr) {
        setErrorMessage(imgErr);
        return;
      }
    }

    setIsPublishing(true);

    // Process Tags
    const tags = formData.tagsText
      .split(",")
      .map((t) => sanitizeInput(t.trim()))
      .filter((t) => t !== "");

    // Process Agenda Text
    const agendaLines = formData.agendaText.split("\n").filter((l) => l.trim() !== "");
    const agenda = agendaLines.map((line) => {
      const parts = line.split("|");
      return {
        time: sanitizeInput(parts[0]?.trim() || "0:00"),
        title: sanitizeInput(parts[1]?.trim() || "Agenda Topic"),
        description: sanitizeInput(parts[2]?.trim() || ""),
      };
    });

    // If no agenda, add defaults
    if (agenda.length === 0) {
      agenda.push(
        { time: cleanTime, title: "Welcome & Brief Overview", description: "Getting settled and mapping context." },
        { time: "Interactive Period", title: "Core Lecture", description: "Step-by-step practical instruction." }
      );
    }

    // Process Tips
    const aiPetTips = formData.aiPetTipsText
      .split("\n")
      .map((t) => sanitizeInput(t.trim()))
      .filter((t) => t !== "");

    const newEventPayload = {
      title: cleanTitle,
      category: cleanCategory,
      petType: cleanPetType,
      date: cleanDate,
      time: cleanTime,
      duration: cleanDuration,
      locationType: formData.locationType,
      location: cleanLocation || (formData.locationType === "online" ? "Online Meeting Link" : "Interactive Field"),
      hostName: cleanHostName,
      hostRole: cleanHostRole,
      hostBio: cleanHostBio,
      description: cleanDescription,
      details: cleanDetails,
      image: cleanImage || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1200&auto=format&fit=crop&q=80",
      capacity: Number(formData.capacity) || 100,
      tags,
      agenda,
      aiPetTips: aiPetTips.length > 0 ? aiPetTips : ["Please consult a local vet for clinic emergencies."],
    };

    try {
      await onCreateEvent(newEventPayload);
      setSuccessMessage(`Successfully published: "${cleanTitle}"!`);
      
      // Reset form title and basic fields
      setFormData((prev) => ({
        ...prev,
        title: "",
        description: "",
        details: "",
        date: "",
        time: "",
        agendaText: "",
        aiPetTipsText: "",
      }));
      setAiSuccessMessage("");
      setDashboardTab("manifest");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to publish event.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Simulating CSV exporting
  const handleExportCSV = () => {
    if (!selectedEvent || !selectedEvent.registrations || selectedEvent.registrations.length === 0) return;

    const headers = "TicketID,Name,Email,PetName,PetType,AgeTier,SpecialRequests,RegisteredAt,CheckedIn\n";
    const rows = selectedEvent.registrations
      .map((r) => {
        return `"${r.id}","${r.name}","${r.email}","${r.petName}","${r.petType}","${r.petAge}","${r.specialRequirements.replace(/"/g, '""')}","${r.registeredAt}","${r.checkedIn}"`;
      })
      .join("\n");

    setCsvPreview(headers + rows);
  };

  // Computed metrics for selected event
  const stats = useMemo(() => {
    if (!selectedEvent) return { count: 0, checkedIn: 0, checkInRate: 0, requirementsCount: 0 };
    const count = selectedEvent.registrations?.length || 0;
    const checkedIn = selectedEvent.registrations?.filter((r) => r.checkedIn).length || 0;
    const checkInRate = count > 0 ? Math.round((checkedIn / count) * 100) : 0;
    const requirementsCount = selectedEvent.registrations?.filter((r) => r.specialRequirements?.trim() !== "").length || 0;

    return { count, checkedIn, checkInRate, requirementsCount };
  }, [selectedEvent]);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-stone-950">Host Workspace & Desk</h2>
          <p className="text-xs text-stone-500 mt-1">Certified Veterinary Education & Training Provider Hub.</p>
        </div>

        {/* Dashboard Views Toggle */}
        <div role="tablist" className="flex rounded-lg bg-stone-100 p-1 border border-stone-200 self-start">
          <button
            role="tab"
            aria-selected={dashboardTab === "manifest"}
            onClick={() => setDashboardTab("manifest")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              dashboardTab === "manifest" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-950"
            }`}
          >
            <Users className="h-4 w-4" />
            Attendees Manifest
          </button>
          <button
            role="tab"
            aria-selected={dashboardTab === "create"}
            onClick={() => setDashboardTab("create")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              dashboardTab === "create" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-950"
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            Publish New Event
          </button>
        </div>
      </div>

      {/* DUAL SECTION LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: Hosted Events Selector & AI Co-Designer widget */}
        <div className="space-y-6">
          
          {/* AI EVENT GENERATOR TOOL */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600 animate-spin" style={{ animationDuration: "3s" }} />
              <h4 className="font-display text-sm font-extrabold text-emerald-900">Event Curriculum Assistant</h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Type an educational topic (e.g. "feline senior wellness", "rabbit dental care") and click generate. Gemini will create a complete syllabus, safety tips, and curriculum details instantly!
            </p>

            <div className="space-y-2.5">
              <div>
                <label className="block text-4xs font-bold text-stone-500 uppercase mb-1">Brief Topic Idea</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Dog Arthritis & Mobility"
                  value={aiIdea}
                  onChange={(e) => setAiIdea(e.target.value)}
                  className="h-9 w-full rounded-xl border border-stone-200 px-3 text-xs font-medium text-stone-900 bg-white outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-4xs font-bold text-stone-500 uppercase mb-1">Target Pet Species</label>
                <select
                  value={aiPetTypeFocus}
                  onChange={(e) => setAiPetTypeFocus(e.target.value)}
                  className="h-9 w-full rounded-xl border border-stone-200 px-2 text-xs font-bold text-stone-700 bg-white outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <option value="Dogs">Dogs</option>
                  <option value="Cats">Cats</option>
                  <option value="Reptiles & Amphibians">Reptiles & Amphibians</option>
                  <option value="Birds">BirdsFocus</option>
                  <option value="All Companions">All Companion Pets</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={isAiPlanning}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 shadow-sm shadow-emerald-600/10 transition-all flex items-center justify-center gap-1.5"
              >
                {isAiPlanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Designing syllabus...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Co-Design with Assistant
                  </>
                )}
              </button>
            </div>
          </div>

          {/* LIST of Hosted Events */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-3.5">
            <h4 className="font-display text-sm font-extrabold text-stone-900">Your Active Curriculums</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedEventId === ev.id
                      ? "border-stone-950 bg-stone-50 shadow-2xs"
                      : "border-stone-150 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex-1 text-left min-w-0 pr-2">
                    <p className={`text-xs font-bold truncate ${selectedEventId === ev.id ? "text-stone-950" : "text-stone-700"}`}>
                      {ev.title}
                    </p>
                    <p className="text-4xs text-stone-400 mt-1 uppercase tracking-wide">
                      {ev.category} • {ev.registrations?.length || 0} enrolled
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to permanently delete this event? This will cancel all attendee reservations.")) {
                        onDeleteEvent(ev.id);
                      }
                    }}
                    className="rounded p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Tab Panel Outputs (2/3 width) */}
        <div className="lg:col-span-2">
          
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-xs text-rose-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <p>{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-teal-50 border border-teal-100 p-3.5 text-xs text-teal-800">
              <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-teal-600" />
              <p>{successMessage}</p>
            </div>
          )}

          {aiSuccessMessage && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 text-xs text-emerald-900 leading-relaxed font-semibold">
              <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              <p>{aiSuccessMessage}</p>
            </div>
          )}

          {/* TAB 1: MANIFEST check-in board */}
          {dashboardTab === "manifest" && (
            <div className="space-y-6 animate-fade-in">
              {selectedEvent ? (
                <>
                  {/* Event Overview Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-stone-200 bg-white p-4 text-center shadow-2xs">
                      <p className="text-3xs font-bold text-stone-400 uppercase">Total Enrolled</p>
                      <p className="font-display text-xl font-extrabold text-stone-900 mt-1">{stats.count}</p>
                    </div>
                    <div className="rounded-xl border border-stone-200 bg-white p-4 text-center shadow-2xs">
                      <p className="text-3xs font-bold text-stone-400 uppercase">Checked In</p>
                      <p className="font-display text-xl font-extrabold text-teal-600 mt-1">{stats.checkedIn}</p>
                    </div>
                    <div className="rounded-xl border border-stone-200 bg-white p-4 text-center shadow-2xs">
                      <p className="text-3xs font-bold text-stone-400 uppercase">Check-in Rate</p>
                      <p className="font-display text-xl font-extrabold text-emerald-600 mt-1">{stats.checkInRate}%</p>
                    </div>
                    <div className="rounded-xl border border-stone-200 bg-white p-4 text-center shadow-2xs">
                      <p className="text-3xs font-bold text-stone-400 uppercase">Special Needs</p>
                      <p className="font-display text-xl font-extrabold text-stone-700 mt-1">{stats.requirementsCount}</p>
                    </div>
                  </div>

                  {/* Manifest List Table container */}
                  <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
                    {/* Manifest Header actions */}
                    <div className="border-b border-stone-150 bg-stone-50/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h4 className="font-display text-sm font-extrabold text-stone-900 text-left">
                          Attendee Manifest: "{selectedEvent.title}"
                        </h4>
                        <p className="text-4xs text-stone-500 mt-0.5 uppercase tracking-wide text-left">
                          {selectedEvent.date} at {selectedEvent.time}
                        </p>
                      </div>

                      <button
                        onClick={handleExportCSV}
                        disabled={!selectedEvent.registrations || selectedEvent.registrations.length === 0}
                        className="rounded-xl border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs px-3.5 py-2 flex items-center justify-center gap-1.5 bg-white disabled:opacity-40 transition-all"
                      >
                        <FileSpreadsheet className="h-4 w-4 text-teal-600" />
                        Export Manifest (CSV)
                      </button>
                    </div>

                    {/* CSV raw text view if exported */}
                    {csvPreview && (
                      <div className="p-4 bg-stone-900 text-stone-100 border-b border-stone-800 font-mono text-3xs space-y-2 animate-fade-in text-left">
                        <div className="flex justify-between items-center text-stone-400">
                          <span>📋 Export preview loaded. Copy raw data:</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(csvPreview);
                              alert("Manifest CSV copied to clipboard!");
                            }}
                            className="bg-stone-800 text-white px-2 py-0.5 rounded text-4xs hover:bg-stone-700 border border-stone-700"
                          >
                            Copy text
                          </button>
                        </div>
                        <pre className="overflow-x-auto max-h-[120px] bg-stone-950 p-2.5 rounded border border-stone-800 text-left">
                          {csvPreview}
                        </pre>
                        <button
                          onClick={() => setCsvPreview(null)}
                          className="text-xs font-bold text-rose-400 hover:text-rose-500"
                        >
                          Hide panel
                        </button>
                      </div>
                    )}

                    {/* Table checklist */}
                    <div className="overflow-x-auto">
                      {!selectedEvent.registrations || selectedEvent.registrations.length === 0 ? (
                        <div className="p-12 text-center">
                          <Users className="h-8 w-8 text-stone-300 mx-auto" />
                          <p className="text-stone-400 text-xs font-semibold mt-2">No pet parents registered for this session yet.</p>
                          <p className="text-stone-500 text-4xs mt-1">Registrations will populate dynamically here once clients submit admission passes.</p>
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead>
                            <tr className="border-b border-stone-200 bg-stone-50/20 text-4xs font-bold uppercase tracking-wider text-stone-400">
                              <th className="px-6 py-3">Checked In</th>
                              <th className="px-6 py-3">Attendee Parent</th>
                              <th className="px-6 py-3">Pet Companion</th>
                              <th className="px-6 py-3">Special requests</th>
                              <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 text-xs">
                            {selectedEvent.registrations.map((reg) => (
                              <tr key={reg.id} className={`hover:bg-stone-50/50 ${reg.checkedIn ? "bg-teal-50/10" : ""}`}>
                                <td className="px-6 py-3">
                                  <button
                                    onClick={() => onToggleCheckIn(selectedEvent.id, reg.id)}
                                    className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                                      reg.checkedIn
                                        ? "bg-teal-600 border-teal-600 text-white"
                                        : "border-stone-300 hover:border-teal-500 text-transparent"
                                    }`}
                                  >
                                    <CheckCircle className="h-3.5 w-3.5 fill-current" />
                                  </button>
                                </td>
                                <td className="px-6 py-3">
                                  <p className="font-bold text-stone-900 leading-tight">{reg.name}</p>
                                  <p className="text-3xs text-stone-400 leading-none mt-1">{reg.email}</p>
                                </td>
                                <td className="px-6 py-3">
                                  {reg.petName !== "None" ? (
                                    <>
                                      <p className="font-semibold text-stone-800 leading-tight">{reg.petName}</p>
                                      <p className="text-3xs text-stone-500 leading-none mt-1">
                                        {reg.petAge} • {reg.petType}
                                      </p>
                                    </>
                                  ) : (
                                    <span className="text-stone-400 font-mono text-3xs">None</span>
                                  )}
                                </td>
                                <td className="px-6 py-3 max-w-[200px]">
                                  {reg.specialRequirements ? (
                                    <p className="text-3xs text-stone-600 truncate leading-relaxed" title={reg.specialRequirements}>
                                      "{reg.specialRequirements}"
                                    </p>
                                  ) : (
                                    <span className="text-stone-300 italic text-4xs">No requirements</span>
                                  )}
                                </td>
                                <td className="px-6 py-3 text-right">
                                  <button
                                    onClick={() => {
                                      if (confirm(`Cancel reservation for ${reg.name}?`)) {
                                        onRemoveRegistration(selectedEvent.id, reg.id);
                                      }
                                    }}
                                    className="text-3xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded px-2 py-1 transition-colors"
                                  >
                                    Cancel Seat
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-12 text-center">
                  <p className="text-stone-400 text-sm font-semibold">You have no hosted events. Plan one with the curriculum planner!</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREATE EVENT FORM */}
          {dashboardTab === "create" && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm animate-fade-in text-left">
              <h3 className="font-display text-base font-extrabold text-stone-900 border-b border-stone-100 pb-3">
                Publish Educational Curriculum
              </h3>

              <form onSubmit={handlePublishSubmit} className="space-y-4 pt-4">
                
                {/* General Title */}
                <div>
                  <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Display Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Feline Trauma & Agility Solutions"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs font-semibold text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-text"
                  />
                </div>

                {/* Categories & Pet type & duration */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Category Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Nutrition"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs font-medium text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-text"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Target Species Focus</label>
                    <input
                      type="text"
                      placeholder="e.g. Cats, Dogs, Puppies"
                      value={formData.petType}
                      onChange={(e) => setFormData({ ...formData, petType: e.target.value })}
                      className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs font-medium text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-text"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Estimated Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 1.5 Hours, 45 Minutes"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs font-medium text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-text"
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs font-bold text-stone-700 bg-white outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Time *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2:00 PM"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs font-medium text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-text"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Maximum Capacity</label>
                    <input
                      type="number"
                      placeholder="100"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                      className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs font-medium text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-text"
                    />
                  </div>
                </div>

                {/* Location setup */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Access Structure</label>
                    <select
                      value={formData.locationType}
                      onChange={(e) => setFormData({ ...formData, locationType: e.target.value as any })}
                      className="h-9 w-full rounded-lg border border-stone-200 px-2 text-xs font-bold text-stone-700 bg-white outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
                    >
                      <option value="online">💻 Online Webinar</option>
                      <option value="in-person">📍 In-Person Seminar</option>
                      <option value="hybrid">✨ Hybrid Structure</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Location Details / Broadcast Link</label>
                    <input
                      type="text"
                      placeholder="e.g. Seattle Veterinary College, Hall B (or Zoom Link)"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs font-medium text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-text"
                    />
                  </div>
                </div>

                {/* Image URL & Tags */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Cover Image URL</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs font-medium text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-text"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Comma-separated Tags</label>
                    <input
                      type="text"
                      placeholder="First Aid, CPR, Behavior"
                      value={formData.tagsText}
                      onChange={(e) => setFormData({ ...formData, tagsText: e.target.value })}
                      className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs font-medium text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-text"
                    />
                  </div>
                </div>

                {/* Host Bio details */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Host Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.hostName}
                      onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                      className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs font-semibold text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-text"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Host Role / Credentials</label>
                    <input
                      type="text"
                      value={formData.hostRole}
                      onChange={(e) => setFormData({ ...formData, hostRole: e.target.value })}
                      className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs font-medium text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-text"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Host Short Bio</label>
                    <input
                      type="text"
                      value={formData.hostBio}
                      onChange={(e) => setFormData({ ...formData, hostBio: e.target.value })}
                      className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs font-medium text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-text"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Short Card Pitch (max 150 chars) *</label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    placeholder="Accidents happen. Learn crucial life-saving emergency CPR skills."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs font-medium text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-text"
                  />
                </div>

                {/* Full deep details (Markdown) */}
                <div>
                  <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Detailed Syllabus Markdown Description</label>
                  <textarea
                    placeholder="Provide full session highlights, target audiences, pre-requisites..."
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-stone-200 p-3 text-xs font-medium text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-text"
                  />
                </div>

                {/* Advanced: Agenda lines */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-3xs font-bold text-stone-500 uppercase">
                      Timeline Syllabus Schedule (One block per line)
                    </label>
                    <span className="text-[9px] text-stone-400 font-semibold">Format: Time | Title | Brief description</span>
                  </div>
                  <textarea
                    placeholder="10:00 AM - 10:30 AM | Welcome & Greet | Getting checked in and seated.&#10;10:30 AM - 11:30 AM | Core Lecture | Step-by-step veterinary guidelines."
                    value={formData.agendaText}
                    onChange={(e) => setFormData({ ...formData, agendaText: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-stone-200 p-3 text-xs font-mono text-stone-850 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-text"
                  />
                </div>

                {/* Advanced: AI Tips lines */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-3xs font-bold text-stone-500 uppercase">
                      Safety & Preparation Tips (One tip per line)
                    </label>
                    <span className="text-[9px] text-stone-400 font-semibold">Add up to 3 tips</span>
                  </div>
                  <textarea
                    placeholder="Never feed cooked bones to canine breeds.&#10;Keep room temperature monitored during the transition."
                    value={formData.aiPetTipsText}
                    onChange={(e) => setFormData({ ...formData, aiPetTipsText: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-stone-200 p-3 text-xs font-mono text-stone-850 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-text"
                  />
                </div>

                {/* Buttons block */}
                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setDashboardTab("manifest")}
                    className="flex-1 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold text-xs py-3 text-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs py-3 text-center transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
                    Publish Active Course
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
