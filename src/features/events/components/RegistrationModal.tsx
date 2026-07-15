import React, { useState } from "react";
import { X, CheckCircle2, Ticket, QrCode, AlertTriangle, ShieldCheck, Mail } from "lucide-react";
import { PetEvent } from "../../../types";
import { useAuth } from "../../../context/AuthContext";
import { validateEmail, validateLength, sanitizeInput } from "../../../utils/validation";

interface RegistrationModalProps {
  event: PetEvent;
  onClose: () => void;
  onRegisterSuccess: (registrationDetails: {
    name: string;
    email: string;
    petName: string;
    petType: string;
    petAge: string;
    specialRequirements: string;
  }) => Promise<void>;
}

export default function RegistrationModal({ event, onClose, onRegisterSuccess }: RegistrationModalProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.fullName || "",
    email: user?.email || "",
    petName: user?.petName || "",
    petType: user?.petType || "Dog",
    petAge: user?.petAge || "Adult",
    specialRequirements: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [ticketData, setTicketData] = useState<any | null>(null);

  // Close modal on escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeInput(formData.name);
    const cleanEmail = sanitizeInput(formData.email);
    const cleanPetName = sanitizeInput(formData.petName);
    const cleanSpecialReq = sanitizeInput(formData.specialRequirements);

    const nameErr = validateLength(cleanName, "Full Name", 2, 80);
    if (nameErr) {
      setErrorMessage(nameErr);
      return;
    }

    const emailErr = validateEmail(cleanEmail);
    if (emailErr) {
      setErrorMessage(emailErr);
      return;
    }

    if (cleanPetName) {
      const petNameErr = validateLength(cleanPetName, "Pet Name", 1, 50);
      if (petNameErr) {
        setErrorMessage(petNameErr);
        return;
      }
    }

    if (cleanSpecialReq) {
      const specialReqErr = validateLength(cleanSpecialReq, "Special requirements", 0, 1000);
      if (specialReqErr) {
        setErrorMessage(specialReqErr);
        return;
      }
    }

    const cleanFormData = {
      name: cleanName,
      email: cleanEmail,
      petName: cleanPetName,
      petType: formData.petType,
      petAge: formData.petAge,
      specialRequirements: cleanSpecialReq,
    };

    setIsLoading(true);
    setErrorMessage("");

    try {
      await onRegisterSuccess(cleanFormData);
      setTicketData({
        ...cleanFormData,
        ticketId: `TCK-${Math.floor(100000 + Math.random() * 900000)}`,
        registeredAt: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      });
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl">
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <h3 id="modal-title" className="font-display text-lg font-bold text-stone-950 flex items-center gap-2 text-left">
            <Ticket className="h-5 w-5 text-emerald-600" />
            {ticketData ? "Admission Pass Issued" : "Secure Event Registration"}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close registration modal"
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {ticketData ? (
          /* SUCCESS PASS CARD */
          <div className="p-6 text-center space-y-6 max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600 border border-teal-200">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-bold text-stone-950">You're Registered!</h4>
              <p className="text-xs text-stone-500">
                A verification copy has been sent to <span className="font-semibold text-stone-800">{ticketData.email}</span>
              </p>
            </div>

            {/* Visual Admission Ticket */}
            <div className="relative overflow-hidden rounded-xl border border-stone-200 bg-stone-50 text-left">
              {/* Ticket Top */}
              <div className="p-5 border-b border-dashed border-stone-200 bg-white">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <span className="text-3xs bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {event.category}
                    </span>
                    <h5 className="font-display text-base font-bold text-stone-950 mt-1.5 leading-snug">
                      {event.title}
                    </h5>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-3xs font-bold text-stone-400 uppercase">PASS ID</span>
                    <p className="font-mono text-xs font-bold text-stone-800">{ticketData.ticketId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs mt-4">
                  <div>
                    <span className="text-3xs text-stone-400 uppercase font-semibold">Date & Time</span>
                    <p className="font-bold text-stone-800">{event.date} at {event.time}</p>
                  </div>
                  <div>
                    <span className="text-3xs text-stone-400 uppercase font-semibold">Access Location</span>
                    <p className="font-bold text-stone-800 truncate">{event.location}</p>
                  </div>
                </div>
              </div>

              {/* Ticket Middle scalloped edges */}
              <div className="absolute left-0 top-[65%] -ml-2 h-4 w-4 rounded-full bg-white border-r border-stone-200 z-10"></div>
              <div className="absolute right-0 top-[65%] -mr-2 h-4 w-4 rounded-full bg-white border-l border-stone-200 z-10"></div>

              {/* Ticket Bottom QR / Pet details */}
              <div className="p-5 flex items-center justify-between gap-6 bg-stone-50">
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-3xs text-stone-400 uppercase font-semibold">Attendee Parent</span>
                    <p className="font-semibold text-stone-800">{ticketData.name}</p>
                  </div>
                  <div>
                    <span className="text-3xs text-stone-400 uppercase font-semibold">Registered Companion</span>
                    <p className="font-semibold text-stone-800">
                      {ticketData.petName} ({ticketData.petAge} {ticketData.petType})
                    </p>
                  </div>
                </div>

                {/* Simulated QR Code */}
                <div className="flex flex-col items-center gap-1">
                  <div className="h-16 w-16 bg-white p-1 rounded-md border border-stone-200 flex items-center justify-center">
                    <QrCode className="h-14 w-14 text-stone-800" />
                  </div>
                  <span className="text-[9px] text-stone-400 font-mono tracking-widest">SCAN AT DOOR</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-1.5 text-3xs text-stone-500 bg-stone-50 p-3 rounded-lg border border-stone-150">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>Veterinary Education Board Verified Admission. Present QR on phone upon arrival.</span>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-xl bg-stone-900 hover:bg-stone-850 py-2.5 text-xs font-bold text-stone-100 transition-colors shadow-sm"
            >
              Close Window
            </button>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto text-left">
            {errorMessage && (
              <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs text-rose-800">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <p>{errorMessage}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-stone-800">Your Contact Details</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs font-medium text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="jane.doe@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs font-medium text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <hr className="border-stone-100" />

            <div className="space-y-2.5">
              <h4 className="text-sm font-bold text-stone-800">Your Pet Companion (Optional)</h4>
              
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Pet Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Biscuit"
                    value={formData.petName}
                    onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                    className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs font-medium text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Pet Type</label>
                  <select
                    value={formData.petType}
                    onChange={(e) => setFormData({ ...formData, petType: e.target.value })}
                    className="h-9 w-full rounded-lg border border-stone-200 px-2 text-xs font-bold text-stone-700 bg-white outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <option value="Dog">🐶 Dog</option>
                    <option value="Cat">🐱 Cat</option>
                    <option value="Reptile">🦎 Reptile / Amphibian</option>
                    <option value="Bird">🦜 Bird</option>
                    <option value="Rodent">🐹 Hamster / Guinea Pig</option>
                    <option value="Horse">🐴 Large Mammal</option>
                    <option value="Other">❓ Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">Pet Age Tier</label>
                  <select
                    value={formData.petAge}
                    onChange={(e) => setFormData({ ...formData, petAge: e.target.value })}
                    className="h-9 w-full rounded-lg border border-stone-200 px-2 text-xs font-bold text-stone-700 bg-white outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <option value="Puppy / Kitten">Baby (Puppy / Kitten)</option>
                    <option value="Adult">Adult</option>
                    <option value="Senior">Senior Care Target</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-3xs font-bold text-stone-500 uppercase mb-1">
                Special requirements, allergies, or questions for host
              </label>
              <textarea
                placeholder="e.g. Bringing a highly reactive rescue dog, are muzzle setups welcome? Or, is translation available?"
                value={formData.specialRequirements}
                onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-stone-200 p-2.5 text-xs font-medium text-stone-900 placeholder-stone-400 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
              />
            </div>

            <div className="rounded-xl bg-teal-50/50 p-3.5 border border-teal-100 flex items-start gap-2 text-2xs text-teal-900 leading-relaxed">
              <Mail className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <span>We value your inbox peace. Your registration email is shared strictly with the certified veterinarian hosts to provide event notes, slides, and educational followups.</span>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold py-2.5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold py-2.5 transition-colors shadow-sm flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {isLoading ? "Generating Pass..." : "Confirm Free Registration"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
