import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, ArrowRight, Sparkles } from "lucide-react";
import { PetEvent } from "../../../types";
import EventCard from "./EventCard";

interface EventDiscoveryProps {
  events: PetEvent[];
  onSelectEvent: (event: PetEvent) => void;
  onExploreAIPermalink?: () => void;
}

export default function EventDiscovery({ events, onSelectEvent, onExploreAIPermalink }: EventDiscoveryProps) {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPetType, setSelectedPetType] = useState("all");

  // Unique Categories computed from events
  const categories = useMemo(() => {
    const list = events.map((e) => e.category);
    return ["all", ...Array.from(new Set(list))];
  }, [events]);

  // Filters logic
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // 1. Search Query
      const matchSearch =
        searchText === "" ||
        e.title.toLowerCase().includes(searchText.toLowerCase()) ||
        e.description.toLowerCase().includes(searchText.toLowerCase()) ||
        e.hostName.toLowerCase().includes(searchText.toLowerCase()) ||
        e.tags.some((t) => t.toLowerCase().includes(searchText.toLowerCase()));

      // 2. Category
      const matchCategory =
        selectedCategory === "all" ||
        e.category.toLowerCase() === selectedCategory.toLowerCase();

      // 3. Pet Type
      let matchPet = true;
      if (selectedPetType !== "all") {
        const evPet = e.petType.toLowerCase();
        if (selectedPetType === "dogs") {
          matchPet = evPet.includes("dog");
        } else if (selectedPetType === "cats") {
          matchPet = evPet.includes("cat");
        } else if (selectedPetType === "reptiles") {
          matchPet = evPet.includes("reptile") || evPet.includes("amphibian");
        } else if (selectedPetType === "others") {
          matchPet = !evPet.includes("dog") && !evPet.includes("cat") && !evPet.includes("reptile");
        }
      }

      return matchSearch && matchCategory && matchPet;
    });
  }, [events, searchText, selectedCategory, selectedPetType]);

  const handleResetFilters = () => {
    setSearchText("");
    setSelectedCategory("all");
    setSelectedPetType("all");
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Hero Header Card */}
      <div className="relative rounded-3xl overflow-hidden bg-stone-900 text-stone-100 p-8 sm:p-12 shadow-xl border border-stone-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/25 via-stone-900/10 to-transparent"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            Pet Care Learning Hub
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 text-white">
            Discover Expert-Led Pet Care Workshops
          </h2>
          <p className="mt-4 text-sm sm:text-base text-stone-300 leading-relaxed font-sans">
            Level up your pet companion's physical comfort, behavior, and nutritional safety. Attend structured lectures led by credentialed emergency veterinarians, behavioral science consultants, and rehabilitation therapists.
          </p>
          {onExploreAIPermalink && (
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={onExploreAIPermalink}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-5 py-2.5 text-xs font-bold text-white transition-colors shadow-md shadow-emerald-600/10"
              >
                Interactive Event Planner
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filtering Bar */}
      <div role="search" className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Left search */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search workshops, hosts, tags (e.g. CPR, diet)..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              aria-label="Search workshops, hosts, and tags"
              className="h-10 w-full rounded-xl border border-stone-200 pl-10 pr-4 text-sm font-medium text-stone-900 placeholder-stone-400 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
            />
          </div>

          {/* Right dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="pet-type-selector" className="flex items-center gap-1.5 text-xs font-semibold text-stone-500">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter by:
            </label>
            
            {/* Pet Type Selector */}
            <select
              id="pet-type-selector"
              value={selectedPetType}
              onChange={(e) => setSelectedPetType(e.target.value)}
              aria-label="Filter by target pet type"
              className="h-10 rounded-xl border border-stone-200 px-3 py-1 text-xs font-bold text-stone-700 bg-white outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <option value="all">🐾 All Pets Types</option>
              <option value="dogs">🐕 Dogs Focus</option>
              <option value="cats">🐈 Cats Focus</option>
              <option value="reptiles">🦎 Reptiles & Amphibians</option>
              <option value="others">🦜 Other Species</option>
            </select>
          </div>
        </div>

        {/* Category badges row */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <div className="flex flex-wrap gap-1.5 items-center" role="group" aria-label="Filter by category">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selectedCategory === cat}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-tight capitalize border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  selectedCategory === cat
                    ? "bg-stone-900 text-stone-100 border-stone-900 shadow-sm"
                    : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200"
                }`}
              >
                {cat === "all" ? "🏷️ All Categories" : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Display */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-stone-950">
            Available Sessions ({filteredEvents.length})
          </h3>
          {(selectedCategory !== "all" || selectedPetType !== "all" || searchText !== "") && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-12 text-center animate-fade-in">
            <p className="text-stone-400 text-sm font-semibold">No workshops matched your current criteria.</p>
            <p className="text-stone-500 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
              Try typing a different keyword or resetting your search filters to view the full curriculum catalog.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 rounded-xl bg-stone-900 hover:bg-stone-850 px-4 py-2 text-xs font-bold text-stone-100 transition-colors"
            >
              Show All Events
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((ev) => (
              <div key={ev.id}>
                <EventCard
                  event={ev}
                  onClick={() => onSelectEvent(ev)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
