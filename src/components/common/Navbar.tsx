import { useState } from "react";
import { Calendar, User, ShieldAlert, LogIn, LogOut, ShieldAlert as KeyIcon, UserCheck, ArrowUpRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "../auth/AuthModal";

interface NavbarProps {
  currentView: "attendee" | "host";
  onViewChange: (view: "attendee" | "host") => void;
}

export default function Navbar({ currentView, onViewChange }: NavbarProps) {
  const { user, role, signOut, changeRole, isSandbox } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const [showRoleDenied, setShowRoleDenied] = useState(false);

  const handleRoleToggle = (view: "attendee" | "host") => {
    if (view === "host") {
      if (!user) {
        setAuthTab("signin");
        setIsAuthModalOpen(true);
        return;
      }
      if (role !== "admin") {
        setShowRoleDenied(true);
        return;
      }
    }
    setShowRoleDenied(false);
    onViewChange(view);
  };

  const handleSignOut = async () => {
    await signOut();
    onViewChange("attendee");
    setShowRoleDenied(false);
  };

  const handleSandboxUpgrade = async () => {
    const success = await changeRole("admin");
    if (success) {
      setShowRoleDenied(false);
      onViewChange("host");
    }
  };

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "PC";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/80 backdrop-blur-md">
        <nav aria-label="Main Navigation" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-sm sm:text-xl font-bold tracking-tight text-stone-900 flex items-center gap-1.5">
                Pet Care Events
                <span className="hidden sm:inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800 border border-teal-100">
                  Education
                </span>
              </h1>
              <p className="hidden xs:block text-[10px] sm:text-2xs text-stone-500 font-medium">Veterinary-Approved Seminars</p>
            </div>
          </div>

          {/* Role Toggle & Nav Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex rounded-lg bg-stone-100 p-1 border border-stone-200" role="radiogroup" aria-label="Select role view">
              <button
                onClick={() => handleRoleToggle("attendee")}
                id="navbar-toggle-attendee"
                role="radio"
                aria-checked={currentView === "attendee"}
                className={`flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  currentView === "attendee"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-950"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Pet Parent</span>
                <span className="xs:hidden">Parent</span>
              </button>
              <button
                onClick={() => handleRoleToggle("host")}
                id="navbar-toggle-host"
                role="radio"
                aria-checked={currentView === "host"}
                className={`flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  currentView === "host"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-stone-500 hover:text-stone-950"
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Host Desk</span>
                <span className="xs:hidden">Host</span>
              </button>
            </div>

            {/* Auth Block */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="h-4 w-px bg-stone-200"></span>

              {!user ? (
                /* GUEST ACTION BUTTONS */
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => {
                      setAuthTab("signin");
                      setIsAuthModalOpen(true);
                    }}
                    id="btn-navbar-signin"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthTab("signup");
                      setIsAuthModalOpen(true);
                    }}
                    id="btn-navbar-signup"
                    className="hidden xs:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-850 text-white text-xs font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    Register
                  </button>
                </div>
              ) : (
                /* AUTHENTICATED USER BADGE & SIGN OUT */
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 pl-1">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center overflow-hidden shrink-0">
                      <span className="text-xs font-bold text-emerald-800">{getInitials(user.fullName)}</span>
                    </div>
                    <div className="hidden md:block text-left text-xs">
                      <p className="font-bold text-stone-950 leading-tight flex items-center gap-1">
                        {user.fullName}
                        {role === "admin" && (
                          <span className="rounded bg-emerald-100 text-emerald-900 px-1 py-0.2 text-[8px] font-extrabold uppercase tracking-wide">
                            Host
                          </span>
                        )}
                      </p>
                      <p className="text-3xs text-stone-500">{user.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    id="btn-navbar-signout"
                    className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-500 hover:text-stone-900 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Dynamic Warning Notification for Role Denied with Sandbox Helper */}
        {showRoleDenied && user && (
          <div id="role-denied-bar" className="bg-emerald-50 border-y border-emerald-200 px-4 py-2 text-center text-xs text-emerald-900">
            <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2.5 font-medium">
              <span className="flex items-center gap-1.5 text-left">
                <KeyIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Access Restricted</strong> — Your account ({user.fullName}) is registered as a{" "}
                  <strong>Pet Parent</strong>. The Host Desk is reserved for authorized instructors and admins.
                </span>
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowRoleDenied(false)}
                  className="px-2.5 py-1 text-2xs font-bold text-stone-500 hover:text-stone-800"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleSandboxUpgrade}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-3xs font-black uppercase tracking-wider px-3 py-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <UserCheck className="h-3 w-3" />
                  Grant Host Access
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Embedded Auth Modal Sheet */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authTab}
      />
    </>
  );
}
