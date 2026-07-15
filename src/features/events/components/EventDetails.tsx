import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  Sparkles,
  Send,
  Loader2,
  CheckCircle,
  Award
} from "lucide-react";
import { PetEvent, ChatMessage, Comment } from "../../../types";
import { useAuth } from "../../../context/AuthContext";
import { validateLength, sanitizeInput } from "../../../utils/validation";

interface EventDetailsProps {
  event: PetEvent;
  onBack: () => void;
  onOpenRegister: () => void;
  isUserRegistered: boolean;
  onAddComment: (text: string, name: string, role: string) => Promise<Comment>;
}

export default function EventDetails({
  event,
  onBack,
  onOpenRegister,
  isUserRegistered,
  onAddComment,
}: EventDetailsProps) {
  const [activeTab, setActiveTab] = useState<"details" | "agenda" | "discussion" | "ai-copilot">("details");
  
  const { user } = useAuth();

  // Discussion states
  const [comments, setComments] = useState<Comment[]>(event.comments || []);
  const [commentText, setCommentText] = useState("");
  const [commentName, setCommentName] = useState("");
  const [commentRole, setCommentRole] = useState("Attendee");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  // Sync comment details dynamically with active user session
  useEffect(() => {
    if (user) {
      setCommentName(user.fullName);
      setCommentRole(user.role === "admin" ? "Host" : "Attendee");
    } else {
      setCommentName("Guest");
      setCommentRole("Attendee");
    }
  }, [user]);

  // AI Expert Assistant states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      sender: "expert",
      text: `Hello! I am your AI Expert Assistant for "${event.title}". Ask me any questions about ${event.petType} or the upcoming veterinary topics we will cover!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Synchronize internal comments state with event object
  useEffect(() => {
    setComments(event.comments || []);
  }, [event]);

  // Scroll chat to bottom
  useEffect(() => {
    if (activeTab === "ai-copilot") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError("");
    const cleanText = sanitizeInput(commentText);
    const textErr = validateLength(cleanText, "Comment message", 1, 500);
    if (textErr) {
      setCommentError(textErr);
      return;
    }

    setIsPostingComment(true);
    try {
      const newComment = await onAddComment(cleanText, commentName, commentRole);
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
    } catch (err: any) {
      console.error("Failed to post comment:", err);
      setCommentError(err.message || "An error occurred while posting your comment.");
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userMsg: ChatMessage = {
      id: `chat-usr-${Date.now()}`,
      sender: "user",
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const prompt = chatInput;
    setChatInput("");
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/ai/ask-expert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          message: prompt,
          chatHistory: chatMessages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with AI Expert.");
      }

      const data = await response.json();
      const expertMsg: ChatMessage = {
        id: `chat-exp-${Date.now()}`,
        sender: "expert",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, expertMsg]);
    } catch (err) {
      console.error("AI chat failed:", err);
      const errorMsg: ChatMessage = {
        id: `chat-err-${Date.now()}`,
        sender: "expert",
        text: "I am having trouble connecting to my veterinary database right now. Please try asking again shortly!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const registeredCount = event.registrations?.length || 0;
  const isFull = registeredCount >= event.capacity;
  const percentFull = Math.min(100, Math.round((registeredCount / event.capacity) * 100));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in items-start text-left">
      
      {/* LEFT COLUMN: Main Event Presentation (2/3 width on large screens) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Back navigation button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-white border border-stone-200 px-3.5 py-2 rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to discovery feed
        </button>

        {/* Core details container */}
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          {/* Hero Banner Image */}
          <div className="relative aspect-video w-full bg-stone-100 overflow-hidden max-h-[360px]">
            <img
              src={event.image}
              alt={event.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/10 to-transparent"></div>
            
            {/* Floating Title info inside banner */}
            <div className="absolute bottom-6 left-6 right-6 text-white text-left">
              <span className="rounded-full bg-emerald-600/90 backdrop-blur-sm px-3 py-1 text-3xs font-bold uppercase tracking-wider text-white border border-emerald-500/20">
                {event.category}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mt-3 text-white leading-tight">
                {event.title}
              </h2>
            </div>
          </div>

          {/* Tab Selection */}
          <div role="tablist" className="flex border-b border-stone-100 bg-stone-50/50">
            {[
              { id: "details", label: "📄 Event Details" },
              { id: "agenda", label: "🗓️ Active Agenda" },
              { id: "discussion", label: "💬 Discussion Board" },
              { id: "ai-copilot", label: "✨ AI Expert Assistant" },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 text-center text-xs font-bold tracking-tight border-b-2 transition-all cursor-pointer focus:outline-none focus-visible:bg-emerald-50/50 focus-visible:text-emerald-900 focus-visible:ring-2 focus-visible:ring-emerald-500/20 ${
                  activeTab === tab.id
                    ? "border-stone-900 text-stone-900 bg-white"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB PANELS */}
          <div className="p-6 sm:p-8">
            
            {/* TAB 1: DETAILS */}
            {activeTab === "details" && (
              <div className="space-y-6 text-left animate-fade-in">
                {/* Short Overview Description */}
                <div className="border-l-4 border-emerald-600 pl-4 py-1.5">
                  <p className="text-sm font-semibold text-stone-800 italic leading-relaxed">
                    "{event.description}"
                  </p>
                </div>

                {/* Main markdown content */}
                <div className="prose prose-stone prose-sm max-w-none text-stone-700 leading-relaxed font-normal whitespace-pre-wrap">
                  {event.details}
                </div>

                {/* Sub-tags list */}
                <div className="flex flex-wrap gap-1.5 pt-4">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-stone-100 border border-stone-200 px-2.5 py-1 text-3xs font-bold text-stone-600 uppercase tracking-wider"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: AGENDA TIMELINE */}
            {activeTab === "agenda" && (
              <div className="space-y-6 text-left animate-fade-in">
                <div>
                  <h4 className="font-display text-base font-bold text-stone-950">Workshop Syllabus</h4>
                  <p className="text-xs text-stone-500 mt-1">Detailed block-by-block curriculum timeline planned with our lead specialist.</p>
                </div>

                {event.agenda && event.agenda.length > 0 ? (
                  <div className="relative pl-6 border-l-2 border-stone-100 space-y-6 ml-2.5">
                    {event.agenda.map((item, idx) => (
                      <div key={idx} className="relative">
                        {/* Bullet node */}
                        <div className="absolute -left-9 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-emerald-600 bg-white text-stone-800">
                          <span className="text-2xs font-bold text-emerald-800">{idx + 1}</span>
                        </div>
                        
                        {/* Agenda Card */}
                        <div className="rounded-xl border border-stone-150 bg-stone-50/40 p-4 shadow-2xs">
                          <span className="font-mono text-3xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            {item.time}
                          </span>
                          <h5 className="font-display text-sm font-bold text-stone-900 mt-2">{item.title}</h5>
                          <p className="text-xs text-stone-600 mt-1 leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                    <p className="text-stone-400 text-xs font-semibold">No formal timeline structured yet. Check back soon!</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PUBLIC DISCUSSION BOARD */}
            {activeTab === "discussion" && (
              <div className="space-y-6 text-left animate-fade-in">
                <div>
                  <h4 className="font-display text-base font-bold text-stone-950">Q&A & Introductions</h4>
                  <p className="text-xs text-stone-500 mt-1">Connect with other pet parents, ask preparation questions, or post your pets.</p>
                </div>

                {/* Comment Feed */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                      <p className="text-stone-400 text-xs font-semibold">No comments posted yet. Start the conversation!</p>
                    </div>
                  ) : (
                    comments.map((com) => (
                      <div key={com.id} className="rounded-xl border border-stone-150 bg-stone-50/50 p-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-700 text-3xs uppercase">
                              {com.name.charAt(0)}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-stone-800">{com.name}</span>
                              <span className={`ml-2 text-4xs font-bold uppercase px-1.5 py-0.5 rounded ${
                                com.role === "Host" || com.role === "Veterinarian"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-stone-200 text-stone-700"
                              }`}>
                                {com.role}
                              </span>
                            </div>
                          </div>
                          <span className="text-4xs text-stone-400">
                            {new Date(com.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-stone-700 leading-relaxed pl-8 pr-2">
                           {com.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Protected Comment Post Form */}
                {!user ? (
                  <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/30 p-5 text-center mt-4">
                    <p className="text-stone-700 text-xs font-bold">Join the Q&A & Introductions!</p>
                    <p className="text-3xs text-stone-500 mt-1 mb-3">Sign in or register to discuss with veterinary specialists and ask questions.</p>
                    <button
                      type="button"
                      onClick={onOpenRegister}
                      id="btn-discussion-auth-prompt"
                      className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-3xs uppercase tracking-wide px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      Sign In / Register
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePostComment} className="pt-4 border-t border-stone-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-4xs font-bold text-stone-400 uppercase mb-1">Your Name</label>
                        <input
                          type="text"
                          required
                          disabled
                          value={commentName}
                          className="h-8 w-full rounded-lg border border-stone-200 px-3 text-xs font-semibold text-stone-500 bg-stone-50"
                        />
                      </div>
                      <div>
                        <label className="block text-4xs font-bold text-stone-400 uppercase mb-1">Your Role</label>
                        <select
                          value={commentRole}
                          onChange={(e) => setCommentRole(e.target.value)}
                          className="h-8 w-full rounded-lg border border-stone-200 px-2 text-xs font-bold text-stone-700 bg-white outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                          <option value="Attendee">Attendee Pet Parent</option>
                          <option value="Veterinarian">Veterinarian</option>
                          <option value="Trainer">Trainer / Consultant</option>
                          <option value="Enthusiast">Pet Care Hobbyist</option>
                          {user.role === "admin" && <option value="Host">Host Desk (Admin)</option>}
                        </select>
                      </div>
                    </div>

                    <div>
                      {commentError && (
                        <div className="text-rose-600 text-3xs font-semibold mb-2 bg-rose-50 border border-rose-100 rounded-lg p-2">
                          ⚠️ {commentError}
                        </div>
                      )}
                      <label className="block text-4xs font-bold text-stone-400 uppercase mb-1">Your Message</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Ask a question or say hello..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="h-9 flex-1 rounded-lg border border-stone-200 px-3.5 text-xs font-medium text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
                        />
                        <button
                          type="submit"
                          disabled={isPostingComment}
                          className="rounded-lg bg-stone-900 hover:bg-stone-850 text-white px-4 flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                          {isPostingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 4: AI ASSISTANT CHAT */}
            {activeTab === "ai-copilot" && (
              <div className="space-y-4 text-left animate-fade-in flex flex-col h-[400px]">
                
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h4 className="font-display text-sm font-bold text-stone-950 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-emerald-600" />
                      Topic-Specific Assistant
                    </h4>
                    <p className="text-4xs text-stone-400 leading-none mt-1">
                      Context-Aware advice regarding "{event.title}"
                    </p>
                  </div>
                  <span className="text-4xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-100 rounded-full px-2 py-0.5 uppercase">
                    online
                  </span>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-3 scroll-smooth">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        msg.sender === "expert"
                          ? "bg-stone-100 text-stone-800 mr-auto rounded-tl-none"
                          : "bg-stone-900 text-stone-100 ml-auto rounded-tr-none"
                      }`}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-wider mb-1 text-stone-400 flex items-center gap-1">
                        {msg.sender === "expert" ? (
                          <>
                            <Sparkles className="h-3 w-3 text-emerald-600" />
                            AI Expert Assistant
                          </>
                        ) : (
                          "Pet Parent"
                        )}
                      </span>
                      <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                      <span className="text-[9px] text-right mt-1 opacity-50 block">{msg.timestamp}</span>
                    </div>
                  ))}

                  {isAiLoading && (
                    <div className="flex items-center gap-1.5 bg-stone-100 text-stone-500 mr-auto rounded-2xl rounded-tl-none p-3 text-xs max-w-[50%] animate-pulse">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                      <span>Expert is thinking...</span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Send Prompt Input */}
                <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-3 border-t border-stone-100">
                  <input
                    type="text"
                    required
                    disabled={isAiLoading}
                    placeholder={`Ask about ${event.petType} health, requirements, behavior...`}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="h-10 flex-1 rounded-xl border border-stone-200 px-4 text-xs font-medium text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 bg-white transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={isAiLoading || !chatInput.trim()}
                    className="rounded-xl bg-stone-900 hover:bg-stone-850 text-white w-10 flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>

        {/* AI Pet Tips Section */}
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6 sm:p-8 text-left">
          <h4 className="font-display text-base font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            AI Expert Pet Care Tips
          </h4>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            Science-backed behavioral and medical advice tailored for this workshop context:
          </p>
          <div className="mt-4 grid gap-3">
            {event.aiPetTips?.map((tip, idx) => (
              <div key={idx} className="flex gap-3 items-start bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-emerald-800 text-xs font-bold mt-0.5 flex-shrink-0">
                  {idx + 1}
                </div>
                <p className="text-xs text-stone-700 leading-relaxed font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Event Logistics & Host Widget (1/3 width) */}
      <div className="space-y-6">
        
        {/* Ticket Actions Panel */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm text-left space-y-4">
          <div className="flex justify-between items-start">
            <span className="font-mono text-xs font-bold text-stone-400 uppercase">TIER</span>
            <span className="text-xs bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded border border-teal-100 uppercase tracking-wide">
              Free Admission
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3 items-start text-xs">
              <Calendar className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-900">{event.date}</p>
                <p className="text-stone-500 text-2xs">Scheduled Session</p>
              </div>
            </div>

            <div className="flex gap-3 items-start text-xs">
              <Clock className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-900">{event.time} ({event.duration})</p>
                <p className="text-stone-500 text-2xs">Estimated Duration</p>
              </div>
            </div>

            <div className="flex gap-3 items-start text-xs">
              <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-900">{event.location}</p>
                <p className="text-stone-500 text-2xs capitalize">Structure Type: {event.locationType}</p>
              </div>
            </div>
          </div>

          <hr className="border-stone-100" />

          {/* Registration Status Indicator */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-stone-400" />
                Capacity progress
              </span>
              <span>
                {registeredCount} / {event.capacity} registered
              </span>
            </div>
            {/* Progress Bar */}
            <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFull ? "bg-rose-500" : "bg-teal-600"
                }`}
                style={{ width: `${percentFull}%` }}
              ></div>
            </div>
          </div>

          {/* Action CTA Button */}
          {isUserRegistered ? (
            <div className="rounded-xl bg-teal-50 border border-teal-150 p-4 text-center space-y-2 animate-fade-in">
              <div className="flex items-center justify-center gap-1.5 text-teal-800 text-xs font-bold">
                <CheckCircle className="h-4 w-4 text-teal-600" />
                Admission Pass Secured
              </div>
              <p className="text-3xs text-teal-600 leading-normal">
                Check-in QR code is loaded on your mobile ticket. See you on {event.date}!
              </p>
            </div>
          ) : (
            <button
              onClick={onOpenRegister}
              disabled={isFull}
              className={`w-full rounded-xl py-3 text-xs font-bold text-white transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isFull
                  ? "bg-stone-200 text-stone-500 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 cursor-pointer"
              }`}
            >
              {isFull ? "Session Fully Registered" : "Secure My Admission Pass (Free)"}
            </button>
          )}
        </div>

        {/* Host Spotlight Card */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm text-left space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-600/10">
              {event.hostName.charAt(0)}
            </div>
            <div>
              <h5 className="font-display text-sm font-bold text-stone-900 leading-tight">{event.hostName}</h5>
              <p className="text-3xs text-stone-500 leading-none mt-1">{event.hostRole}</p>
            </div>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed font-normal">
            {event.hostBio}
          </p>
          <div className="flex items-center gap-1.5 text-4xs font-bold text-stone-400 uppercase tracking-wider bg-stone-50 p-2.5 rounded-lg border border-stone-150">
            <Award className="h-4 w-4 text-teal-600" />
            <span>Certified Education Partner</span>
          </div>
        </div>

      </div>

    </div>
  );
}
