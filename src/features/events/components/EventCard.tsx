import React from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { PetEvent } from "../../../types";

interface EventCardProps {
  event: PetEvent;
  onClick: () => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const registeredCount = event.registrations?.length || 0;
  const isFull = registeredCount >= event.capacity;
  const percentFull = Math.min(100, Math.round((registeredCount / event.capacity) * 100));

  // Category specific styles
  const getCategoryStyles = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("emergency") || cat.includes("medicine") || cat.includes("first aid")) {
      return "bg-rose-50 text-rose-800 border-rose-100";
    }
    if (cat.includes("behavior") || cat.includes("psychology") || cat.includes("train")) {
      return "bg-indigo-50 text-indigo-800 border-indigo-100";
    }
    if (cat.includes("nutrition") || cat.includes("diet")) {
      return "bg-teal-50 text-teal-800 border-teal-100";
    }
    if (cat.includes("rehab") || cat.includes("mobility") || cat.includes("senior")) {
      return "bg-emerald-50 text-emerald-800 border-emerald-100";
    }
    return "bg-stone-50 text-stone-700 border-stone-200";
  };

  // Human readable date formatting
  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
      return new Date(dateStr).toLocaleDateString("en-US", options);
    } catch {
      return dateStr;
    }
  };

  // Handle keypress down (Enter or Space) to trigger click
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${event.title}, hosted by ${event.hostName}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
    >
      {/* Banner Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
        <img
          src={event.image}
          alt={event.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Absolute Badge Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm ${getCategoryStyles(event.category)}`}>
            {event.category}
          </span>
        </div>
        
        {/* Online/In-person Indicator */}
        <div className="absolute bottom-3 right-3 rounded-md bg-stone-900/80 px-2 py-1 text-3xs font-semibold text-white uppercase tracking-wider backdrop-blur-sm">
          {event.locationType}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Metadata */}
        <div className="mb-2.5 flex items-center gap-3 text-xs text-stone-500 font-medium">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
            {formatDate(event.date)}
          </span>
          <span className="h-3 w-px bg-stone-200"></span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-stone-400" />
            {event.time}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-bold text-stone-950 leading-snug group-hover:text-emerald-600 transition-colors">
          {event.title}
        </h3>

        {/* Short Description */}
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-stone-600 leading-relaxed">
          {event.description}
        </p>

        {/* Location snippet */}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-stone-500 font-medium">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-stone-400" />
          <span className="truncate">{event.location}</span>
        </div>

        {/* Separator */}
        <hr className="my-4 border-stone-100" />

        {/* Registrants & Progress info */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1.5">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-stone-400" />
              {registeredCount} / {event.capacity} registered
            </span>
            <span className={isFull ? "text-rose-600" : "text-stone-500"}>
              {isFull ? "Full" : `${percentFull}%`}
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

        {/* Host Info Footer */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-700 text-3xs">
            {event.hostName.charAt(0)}
          </div>
          <div className="text-left text-2xs truncate flex-1">
            <p className="font-semibold text-stone-900 leading-none truncate">{event.hostName}</p>
            <p className="text-stone-500 mt-0.5 truncate">{event.hostRole}</p>
          </div>
          <div className="text-right">
            <span className="text-3xs bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              FREE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
