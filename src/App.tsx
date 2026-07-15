import { useState } from "react";
import { Loader2, AlertTriangle, ShieldAlert, ArrowLeft } from "lucide-react";
import Navbar from "./components/common/Navbar";
import EventDiscovery from "./features/events/components/EventDiscovery";
import EventDetails from "./features/events/components/EventDetails";
import HostDashboard from "./features/host/components/HostDashboard";
import RegistrationModal from "./features/events/components/RegistrationModal";
import BackgroundDecoration from "./components/common/BackgroundDecoration";
import AuthModal from "./components/auth/AuthModal";
import { useEvents } from "./hooks/useEvents";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const {
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
  } = useEvents();

  const { user, role } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/20">
      
      {/* Dynamic Ambient Background Animations */}
      <BackgroundDecoration />

      {/* Navigation */}
      <Navbar currentView={roleView} onViewChange={setRoleView} />

      {/* Main Content Space */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {isLoading ? (
          <div className="flex h-[50vh] flex-col items-center justify-center gap-3 text-stone-500">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-xs font-semibold uppercase tracking-wider">Syncing curriculum database...</p>
          </div>
        ) : errorText ? (
          <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center space-y-4 shadow-sm">
            <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
            <h3 className="font-display text-lg font-bold text-stone-900">Database Booting</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              We are spinning up the local container database. Click retry to sync the curriculum list once active.
            </p>
            <button
              onClick={() => {
                setIsLoading(true);
                fetchEvents();
              }}
              className="w-full rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-bold text-xs py-2.5 transition-colors"
            >
              Retry Database Sync
            </button>
          </div>
        ) : (
          /* ACTIVE APP VIEWS */
          <div className="space-y-6">
            {roleView === "host" && (!user || role !== "admin") ? (
              /* ROLE-BASED ROUTE ACCESS GUARD */
              <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-8 space-y-5 shadow-sm animate-fade-in text-left mt-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div className="text-center space-y-1.5">
                  <h3 className="font-display text-lg font-bold text-stone-900">Host Credentials Required</h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-medium">
                    The Instructor Desk is reserved for verified veterinarians, professional pet care instructors, and platform administrators.
                  </p>
                </div>
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 transition-colors cursor-pointer"
                  >
                    Authenticate / Request Host Access
                  </button>
                  <button
                    onClick={() => setRoleView("attendee")}
                    className="w-full rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs py-2.5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Return to discovery feed
                  </button>
                </div>
              </div>
            ) : roleView === "host" ? (
              /* HOST WORKSPACE VIEW */
              <HostDashboard
                events={events}
                onCreateEvent={createEvent}
                onDeleteEvent={deleteEvent}
                onToggleCheckIn={toggleCheckIn}
                onRemoveRegistration={removeRegistration}
              />
            ) : selectedEvent ? (
              /* SINGLE EVENT IN-DEPTH PRESENTER */
              <EventDetails
                event={selectedEvent}
                onBack={() => setSelectedEvent(null)}
                onOpenRegister={() => {
                  if (!user) {
                    setIsAuthModalOpen(true);
                  } else {
                    setIsRegisterModalOpen(true);
                  }
                }}
                isUserRegistered={!!localRegisteredEventIds[selectedEvent.id]}
                onAddComment={addComment}
              />
            ) : (
              /* EVENT DISCOVERY VIEW */
              <EventDiscovery
                events={events}
                onSelectEvent={setSelectedEvent}
                onExploreAIPermalink={() => {
                  if (!user || role !== "admin") {
                    setIsAuthModalOpen(true);
                  } else {
                    setRoleView("host");
                  }
                }}
              />
            )}
          </div>
        )}

      </main>

      {/* Slide Drawer / Modal for Event Registration */}
      {isRegisterModalOpen && selectedEvent && (
        <RegistrationModal
          event={selectedEvent}
          onClose={() => setIsRegisterModalOpen(false)}
          onRegisterSuccess={registerForEvent}
        />
      )}

      {/* Embedded Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Small design credit label */}
      <footer className="py-6 border-t border-stone-100 text-center text-3xs font-semibold text-stone-400">
        <p>© 2026 Pet Care Events Inc. Certified Veterinary Education Network.</p>
      </footer>
    </div>
  );
}
