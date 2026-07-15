import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Mail,
  Lock,
  User,
  Shield,
  PawPrint,
  Cat,
  Dog,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../services/authService";
import { validateEmail, validatePassword, validateLength, sanitizeInput } from "../../utils/validation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "signin" | "signup";
}

type FormView = "signin" | "signup" | "forgot" | "reset";

export default function AuthModal({ isOpen, onClose, initialTab = "signin" }: AuthModalProps) {
  const { signIn, signUp, forgotPassword, resetPassword, isSandbox, error, clearError } = useAuth();

  const [view, setView] = useState<FormView>(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");

  // Pet Meta
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("Dog");
  const [petAge, setPetAge] = useState("Puppy");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Close modal on escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    clearError();
    setFormError(null);
    setSuccessMsg(null);
    onClose();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = sanitizeInput(email);
    const emailErr = validateEmail(cleanEmail);
    if (emailErr) {
      setFormError(emailErr);
      return;
    }
    const pwdErr = validatePassword(password);
    if (pwdErr) {
      setFormError(pwdErr);
      return;
    }

    setLoading(true);
    setFormError(null);
    clearError();

    const res = await signIn(cleanEmail, password);
    setLoading(false);
    if (!res.error) {
      handleClose();
    } else {
      setFormError(res.error);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = sanitizeInput(email);
    const cleanFullName = sanitizeInput(fullName);
    const cleanPetName = sanitizeInput(petName);

    const nameErr = validateLength(cleanFullName, "Full Name", 2, 80);
    if (nameErr) {
      setFormError(nameErr);
      return;
    }

    const emailErr = validateEmail(cleanEmail);
    if (emailErr) {
      setFormError(emailErr);
      return;
    }

    const pwdErr = validatePassword(password);
    if (pwdErr) {
      setFormError(pwdErr);
      return;
    }

    if (selectedRole === "user" && cleanPetName) {
      const petNameErr = validateLength(cleanPetName, "Pet Name", 1, 50);
      if (petNameErr) {
        setFormError(petNameErr);
        return;
      }
    }

    setLoading(true);
    setFormError(null);
    clearError();

    const petDetails =
      selectedRole === "user"
        ? { petName: cleanPetName || "None", petType, petAge }
        : undefined;

    const res = await signUp(cleanEmail, password, cleanFullName, selectedRole, petDetails);
    setLoading(false);
    if (!res.error) {
      if (res.session) {
        handleClose();
      } else {
        setSuccessMsg("Registration initiated! Please verify your email.");
      }
    } else {
      setFormError(res.error);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = sanitizeInput(email);
    const emailErr = validateEmail(cleanEmail);
    if (emailErr) {
      setFormError(emailErr);
      return;
    }
    setLoading(true);
    setFormError(null);
    clearError();

    const res = await forgotPassword(cleanEmail);
    setLoading(false);
    if (res.success) {
      setSuccessMsg(
        isSandbox
          ? "Sandbox simulation: Password reset authorized. Switch to Reset password view."
          : "Password reset link sent! Check your inbox."
      );
      if (isSandbox) {
        setTimeout(() => {
          setView("reset");
          setSuccessMsg(null);
        }, 1500);
      }
    } else {
      setFormError(res.error);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwdErr = validatePassword(password);
    if (pwdErr) {
      setFormError(pwdErr);
      return;
    }
    setLoading(true);
    setFormError(null);
    clearError();

    const res = await resetPassword(password);
    setLoading(false);
    if (res.success) {
      setSuccessMsg("Your password has been reset successfully! You can now log in.");
      setTimeout(() => {
        setView("signin");
        setSuccessMsg(null);
        setPassword("");
      }, 2000);
    } else {
      setFormError(res.error);
    }
  };

  const toggleView = (newView: FormView) => {
    setView(newView);
    setFormError(null);
    setSuccessMsg(null);
    clearError();
  };

  return (
    <div
      id="auth-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        id="auth-modal-container"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
      >
        {/* Modal Header Decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          id="btn-close-auth-modal"
          aria-label="Close authentication modal"
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Logo & Main Title */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-2.5 border border-emerald-100">
              <PawPrint className="h-6 w-6" />
            </div>
            <h2 id="auth-modal-title" className="font-display text-xl font-extrabold text-stone-900 tracking-tight">
              {view === "signin" && "Welcome Back"}
              {view === "signup" && "Create your Account"}
              {view === "forgot" && "Recover Password"}
              {view === "reset" && "Reset Password"}
            </h2>
            <p className="text-2xs text-stone-500 font-medium max-w-[280px]">
              {view === "signin" && "Sign in to access events, materials, and discuss with veterinary experts."}
              {view === "signup" && "Join a passionate network of pet owners, veterinarians, and trainers."}
              {view === "forgot" && "Enter your email address and we'll send you instructions to reset your password."}
              {view === "reset" && "Enter a new secure password for your account."}
            </p>
          </div>

          {/* Feedback banners */}
          {(formError || error) && (
            <div id="auth-error-banner" className="mb-4 flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-xs text-rose-800">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500 mt-0.5" />
              <p className="font-medium leading-normal">{formError || error}</p>
            </div>
          )}

          {successMsg && (
            <div id="auth-success-banner" className="mb-4 flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 text-xs text-emerald-800">
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500 mt-0.5" />
              <p className="font-medium leading-normal">{successMsg}</p>
            </div>
          )}

          {/* Tabs for Login / Register */}
          {(view === "signin" || view === "signup") && (
            <div className="flex border-b border-stone-100 mb-5 text-center">
              <button
                onClick={() => toggleView("signin")}
                className={`flex-1 pb-2.5 text-xs font-bold tracking-wide uppercase border-b-2 transition-all ${
                  view === "signin"
                    ? "border-emerald-600 text-stone-900"
                    : "border-transparent text-stone-400 hover:text-stone-600"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => toggleView("signup")}
                className={`flex-1 pb-2.5 text-xs font-bold tracking-wide uppercase border-b-2 transition-all ${
                  view === "signup"
                    ? "border-emerald-600 text-stone-900"
                    : "border-transparent text-stone-400 hover:text-stone-600"
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* FORMS CONTAINER */}
          <form onSubmit={
            view === "signin" ? handleSignIn :
            view === "signup" ? handleSignUp :
            view === "forgot" ? handleForgot : handleReset
          } className="space-y-4">
            
            {/* Full Name (Sign Up only) */}
            {view === "signup" && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Lily Mits"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/30 py-2 pl-9 pr-4 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Email Field (Visible in all views except Reset) */}
            {view !== "reset" && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/30 py-2 pl-9 pr-4 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Password Field (Visible in Sign In, Sign Up, and Reset) */}
            {view !== "forgot" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    {view === "reset" ? "New Password" : "Password"}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  {view === "signin" && (
                    <button
                      type="button"
                      onClick={() => toggleView("forgot")}
                      className="text-2xs font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/30 py-2 pl-9 pr-4 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Role & Pet details (Sign Up only) */}
            {view === "signup" && (
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Platform Role <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("user")}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-2xs font-bold transition-all ${
                        selectedRole === "user"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                          : "bg-stone-50/30 border-stone-200 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      <User className="h-3.5 w-3.5 shrink-0" />
                      Pet Parent
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("admin")}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-2xs font-bold transition-all ${
                        selectedRole === "admin"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                          : "bg-stone-50/30 border-stone-200 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      <Shield className="h-3.5 w-3.5 shrink-0" />
                      Host Desk (Admin)
                    </button>
                  </div>
                </div>

                {/* Pet Customizer (Only for Pet Parent role) */}
                <AnimatePresence>
                  {selectedRole === "user" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-stone-100 pt-3 space-y-3"
                    >
                      <h4 className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                        <PawPrint className="h-3 w-3" /> About Your Companion (Optional)
                      </h4>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-3xs font-bold uppercase tracking-wider text-stone-500">Pet Name</label>
                          <input
                            type="text"
                            value={petName}
                            onChange={(e) => setPetName(e.target.value)}
                            placeholder="e.g. Biscuit"
                            className="w-full rounded-lg border border-stone-200 bg-stone-50/20 py-1.5 px-3 text-xs font-medium text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-3xs font-bold uppercase tracking-wider text-stone-500">Pet Type</label>
                          <select
                            value={petType}
                            onChange={(e) => setPetType(e.target.value)}
                            className="w-full rounded-lg border border-stone-200 bg-stone-50/20 py-1.5 px-3 text-xs font-medium text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
                          >
                            <option>Dog</option>
                            <option>Cat</option>
                            <option>Reptile</option>
                            <option>Bird</option>
                            <option>Small Critter</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold uppercase tracking-wider text-stone-500">Pet Age Group</label>
                        <div className="flex gap-2">
                          {["Puppy", "Adult", "Senior"].map((age) => (
                            <button
                              key={age}
                              type="button"
                              onClick={() => setPetAge(age)}
                              className={`flex-1 py-1.5 px-2 rounded-lg border text-3xs font-bold transition-all ${
                                petAge === age
                                  ? "bg-emerald-100/50 border-emerald-400 text-emerald-800"
                                  : "bg-white border-stone-200 text-stone-500 hover:bg-stone-50"
                              }`}
                            >
                              {age}
                              {age === "Puppy" && petType === "Cat" && " (Kitten)"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/10"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {view === "signin" && "Sign In"}
                  {view === "signup" && "Register Account"}
                  {view === "forgot" && "Send Instructions"}
                  {view === "reset" && "Update Password"}
                </>
              )}
            </button>
          </form>

          {/* Secondary helper controls */}
          {view === "forgot" && (
            <button
              onClick={() => toggleView("signin")}
              className="mt-4 flex items-center justify-center gap-1 w-full text-center text-xs font-semibold text-stone-500 hover:text-stone-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </button>
          )}

          {view === "reset" && (
            <button
              onClick={() => toggleView("signin")}
              className="mt-4 flex items-center justify-center gap-1 w-full text-center text-xs font-semibold text-stone-500 hover:text-stone-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </button>
          )}

          {/* Mode Indicator Footer */}
          <div className="mt-6 border-t border-stone-100 pt-4 flex items-center justify-between text-4xs uppercase tracking-widest font-extrabold text-stone-400">
            <span>Auth Protocol</span>
            {isSandbox ? (
              <span className="rounded-full bg-stone-100 border border-stone-200 text-stone-600 px-2.5 py-0.5 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-pulse" />
                Dev Sandbox Mode
              </span>
            ) : (
              <span className="rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-0.5 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Supabase Online
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
