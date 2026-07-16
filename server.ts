import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { validateEmail, validateLength, validateCapacity, validateUrl, validateDate, sanitizeInput } from "./src/utils/validation";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Database path
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial Mock/Seed Data
const INITIAL_EVENTS = [
  {
    id: "evt-1",
    title: "Puppy & Kitten First Aid Essentials",
    category: "Emergency Medicine",
    petType: "Dogs & Cats",
    date: "2026-08-15",
    time: "10:00 AM",
    duration: "2 Hours",
    locationType: "hybrid",
    location: "Oakland Animal Trauma Center & Zoom",
    hostName: "Dr. Aris Thorne, DVM",
    hostRole: "Veterinary Emergency Surgeon",
    hostBio: "Dr. Thorne has over 15 years of experience in emergency veterinary clinics. He is passionate about empowering pet owners with immediate life-saving techniques.",
    description: "Accidents happen when you least expect them. Learn crucial life-saving skills for the first critical minutes of an emergency, including CPR, choking relief, and wound dressing.",
    details: "This workshop is designed for pet parents, foster carers, and pet sitters. Dr. Aris Thorne will demonstrate techniques using professional animal CPR mannequins. \n\n**What we will cover:**\n- CPR and chest compression mechanics for various pet sizes\n- Identifying poisoning symptoms and immediate response\n- How to bandage a paw securely and stop acute bleeding\n- Heatstroke prevention and cooling algorithms\n\nAttendees who complete the full session will receive a Pet Care First Aid digital badge of attendance.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80",
    capacity: 150,
    tags: ["First Aid", "CPR", "Puppy Care", "Kitten Care", "Health"],
    agenda: [
      { time: "10:00 AM - 10:30 AM", title: "Emergency Recognition", description: "Learn how to assess vital signs (pulse, gums, temperature) in dogs and cats." },
      { time: "10:30 AM - 11:15 AM", title: "Hands-on CPR & Choking Mechanics", description: "Demonstrations on compression counts, breath distribution, and clearing air passages." },
      { time: "11:15 AM - 11:45 AM", title: "Wound Dressing & Toxins", description: "Applying emergency pressure bandages and how to respond to household ingestion." },
      { time: "11:45 AM - 12:00 PM", title: "Interactive Q&A Session", description: "Dr. Thorne answers your specific household safety questions." }
    ],
    aiPetTips: [
      "Keep a dedicated pet first aid kit containing cohesive bandages, saline wash, tweezers, and emergency clinic contacts.",
      "Never give your pet human pain medications like ibuprofen or paracetamol, which are highly toxic.",
      "In an emergency, keep yourself calm: pets can sense your panic, making their heart rate and shock level increase."
    ],
    registrations: [
      {
        id: "reg-1-1",
        name: "Clara Vance",
        email: "clara.v@example.com",
        petName: "Biscuit",
        petType: "Dog",
        petAge: "Puppy",
        specialRequirements: "Wants to know if senior dogs require different CPR ratios.",
        registeredAt: "2026-07-13T09:00:00Z",
        checkedIn: false
      },
      {
        id: "reg-1-2",
        name: "Marcus Aurelius",
        email: "marcus.a@example.com",
        petName: "Luna",
        petType: "Cat",
        petAge: "Kitten",
        specialRequirements: "Bringing Biscuit's rescue mate.",
        registeredAt: "2026-07-13T09:30:00Z",
        checkedIn: true
      }
    ],
    comments: [
      {
        id: "com-1-1",
        name: "Clara Vance",
        role: "Attendee",
        text: "Super excited about this! Biscuit is 4 months old and has a habit of chewing on literally everything. First aid is definitely a must-learn.",
        timestamp: "2026-07-13T09:05:00Z"
      },
      {
        id: "com-1-2",
        name: "Dr. Aris Thorne, DVM",
        role: "Host",
        text: "Welcome Clara! Biscuit is at the prime age for curiosity. I'll make sure to cover common household items puppies love to chew that are actually toxic hazards.",
        timestamp: "2026-07-13T09:40:00Z"
      }
    ]
  },
  {
    id: "evt-2",
    title: "Decoding Feline Behavior: From Hissing to Purring",
    category: "Behavioral Science",
    petType: "Cats",
    date: "2026-08-22",
    time: "2:00 PM",
    duration: "1.5 Hours",
    locationType: "online",
    location: "Google Meet Broadcast",
    hostName: "Sarah Vance",
    hostRole: "Certified Feline Behavior Consultant",
    hostBio: "Sarah Vance is an international feline behavior expert who specializes in feline trauma resolution and helping multicat households coexist peacefully.",
    description: "Cats are notoriously misunderstood. Join our behavioral science expert to decode feline body language, solve litter box issues, and discover true environmental enrichment techniques.",
    details: "Felines are highly communicative creatures, but they speak a language very different from humans or canines. Sarah Vance will teach you how to read subtle tail movements, ear twitches, and vocalizations.\n\n**In this online broadcast, you will discover:**\n- The subtle physical indicators of stress, overstimulation, and pain\n- How to resolve litterbox aversion without clinical causes\n- Introduction strategies that prevent territorial wars between cats\n- Play therapy routines that satisfy the wild predatory sequence",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&auto=format&fit=crop&q=80",
    capacity: 300,
    tags: ["Cat Psychology", "Feline Behavior", "Territoriality", "Enrichment"],
    agenda: [
      { time: "2:00 PM - 2:30 PM", title: "Anatomy of Feline Language", description: "Breaking down pupil dilation, slow-blinks, tail positions, and micro-postures." },
      { time: "2:30 PM - 3:00 PM", title: "Litterbox & Territory Resolution", description: "The 1+1 rule of litterboxes, scent swapping, and stress-reduction setups." },
      { time: "3:00 PM - 3:15 PM", title: "The Predatory Sequence", description: "Stalk, pounce, kill, eat, groom, and sleep. How to implement proper interactive toy play." },
      { time: "3:15 PM - 3:30 PM", title: "Live Audited Cases", description: "Sarah reviews real-world attendee video submissions of cat-to-cat friction." }
    ],
    aiPetTips: [
      "Always set up 'vertical territory' (cat trees, shelves) to allow cats to view their environment from a secure height.",
      "A tail slowly wagging back and forth isn't excitement like in dogs—it is usually a signal of growing emotional conflict or irritation.",
      "Never punish a cat physically or verbally; they do not learn from reprimands, and it only damages their fragile trust."
    ],
    registrations: [
      {
        id: "reg-2-1",
        name: "Julian Finch",
        email: "julian@catsrule.example.com",
        petName: "Cleo",
        petType: "Cat",
        petAge: "Adult",
        specialRequirements: "Cleo keeps chasing my other cat, Sylvester.",
        registeredAt: "2026-07-13T09:12:00Z",
        checkedIn: false
      }
    ],
    comments: []
  },
  {
    id: "evt-3",
    title: "Advanced Canine Nutrition: Beyond the Kibble",
    category: "Nutrition",
    petType: "Dogs",
    date: "2026-09-05",
    time: "1:00 PM",
    duration: "2.5 Hours",
    locationType: "in-person",
    location: "Seattle Canine Education Center, Hall B",
    hostName: "Prof. Marcus Vance, PhD",
    hostRole: "Veterinary Nutrition Scientist",
    hostBio: "Professor Vance is a researcher and speaker with two decades of expertise in commercial food manufacturing and home-formulated veterinary therapeutic diets.",
    description: "An intensive seminar on custom diets, identifying raw nutrition safety protocols, managing allergies, and learning how to interpret commercial pet food labels objectively.",
    details: "What goes into your dog's bowl shapes every aspect of their long-term health. Prof. Marcus Vance will dissect commercial ingredient list myths, outline the raw vs. cooked veterinary debate, and explain how to formulate balanced food additions.\n\n*Please note: This is an educational lecture. We do not promote specific commercial brands. Bring a notepad and your dog's current food ingredient panel!*",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&auto=format&fit=crop&q=80",
    capacity: 80,
    tags: ["Canine Nutrition", "Dog Food", "Allergies", "Veterinary Diet"],
    agenda: [
      { time: "1:00 PM - 1:45 PM", title: "Decoding the Ingredient Panel", description: "Identifying fillers, artificial preservatives, and biological protein percentages." },
      { time: "1:45 PM - 2:30 PM", title: "Alternative Diets: Raw, Dehydrated, Cooked", description: "A balanced clinical overview of safety, nutritional gaps, and pathogen mitigation." },
      { time: "2:30 PM - 3:00 PM", title: "Custom Add-ins & Supplements", description: "How to safely supplement with bone broth, fresh berries, omega-3s, and probiotics." },
      { time: "3:00 PM - 3:30 PM", title: "Attendee Panel Breakdown", description: "Prof. Vance reviews commercial bags brought by the audience live on stage." }
    ],
    aiPetTips: [
      "Avoid feeding cooked bones under any circumstances; they splinter easily and can cause severe internal perforation.",
      "When switching your pet's diet, transition slowly over 7-10 days to prevent acute gastroenteritis and diarrhea.",
      "Garlic, onions, grapes, raisins, and chocolate are highly toxic—make sure food preps are safe from counters."
    ],
    registrations: [],
    comments: []
  },
  {
    id: "evt-4",
    title: "Senior Dog Mobility & Enrichment Workshop",
    category: "Rehabilitation",
    petType: "Dogs",
    date: "2026-09-12",
    time: "11:00 AM",
    duration: "2 Hours",
    locationType: "in-person",
    location: "Bark & Balance Rehabilitation Clinic, Portland",
    hostName: "Dr. Chloe Bennett",
    hostRole: "Canine Rehab Therapist & DPT",
    hostBio: "Dr. Chloe Bennett operates Portland's premier canine physical therapy facility, helping aging and post-operative dogs regain joy, balance, and independence.",
    description: "Help your aging companion age with dignity and comfort. This hands-on workshop covers gentle massage, passive range-of-motion exercises, and low-impact sensory enrichment.",
    details: "As dogs enter their golden years, osteoarthritis and cognitive decline can dramatically affect their quality of life. This hands-on workshop will teach pet parents physical and cognitive exercises designed specifically for senior dogs.\n\n**Special Guidelines:**\n- Highly reactive dogs should not attend in person. You may register to receive the live broadcast stream.\n- One companion dog per registrant is welcome, provided they are comfortable in a group rehabilitation room.",
    image: "https://images.unsplash.com/photo-1534361960057-19889db9621e?w=1200&auto=format&fit=crop&q=80",
    capacity: 50,
    tags: ["Senior Dogs", "Mobility", "Arthritis", "Massage", "Rehab"],
    agenda: [
      { time: "11:00 AM - 11:30 AM", title: "Understanding Senior Dog Orthopedics", description: "How to identify subtle signs of chronic arthritis and nerve weakness." },
      { time: "11:30 AM - 12:15 PM", title: "Guided Canine Massage & Stretches", description: "Learning soft tissue compression and safe passive joint extensions." },
      { time: "12:15 PM - 12:45 PM", title: "Environmental Modifications", description: "Ramp training, secure traction rugs, and orthopedic bedding layouts." },
      { time: "12:45 PM - 1:00 PM", title: "Cognitive Playtime", description: "Scent-work games that keep old brains engaged without exhausting fragile joints." }
    ],
    aiPetTips: [
      "Add non-slip rugs along hardwood floors; slippery floors are major injury hazards for dogs with weak leg joints.",
      "Scent work (hiding treats in towels) is highly exhausting and satisfying for senior dogs who cannot walk far.",
      "Keep nails trimmed short; long nails alter their foot posture, significantly compounding arthritic leg strain."
    ],
    registrations: [],
    comments: []
  },
  {
    id: "evt-5",
    title: "Reptile Bioactive Enclosures Masterclass",
    category: "Exotic Husbandry",
    petType: "Reptiles & Amphibians",
    date: "2026-09-20",
    time: "3:00 PM",
    duration: "2 Hours",
    locationType: "hybrid",
    location: "Exotic Reptile Sanctuary, Austin & YouTube Live",
    hostName: "Liam Thorne",
    hostRole: "Professional Herpetologist & Ecologist",
    hostBio: "Liam Thorne has built over 500 bioactive systems for zoological facilities and private hobbyists, specializing in replicating true microclimates.",
    description: "Learn the secrets behind creating thriving self-sustaining bioactive vivariums. We cover soil chemistry, custodians (springtails & isopods), live plants, and optimal humidity/lighting grids.",
    details: "Moving beyond basic plastic hides and paper towels. A bioactive enclosure is an active ecosystem where waste is naturally recycled, live plants thrive, and reptiles exhibit their natural evolutionary behaviors.\n\n**What you will learn in this session:**\n- Layer mechanics: Drainage barrier, custom substrate blend, leaf litter, and wood\n- Custodian selection: Identifying springtails, dwarf white isopods, and dairy cow isopods\n- Selecting robust terrarium plants that survive heavy climbing reptiles\n- Simulating microclimates: UV index curves, misting systems, and radiant heat gradients",
    image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=1200&auto=format&fit=crop&q=80",
    capacity: 100,
    tags: ["Reptiles", "Husbandry", "Bioactive", "Ecological Vivaria"],
    agenda: [
      { time: "3:00 PM - 3:30 PM", title: "The Drainage & Substrate Grid", description: "Why clay balls block root rot, and formulating custom coconut-coir mixes." },
      { time: "3:30 PM - 4:00 PM", title: "The Clean-Up Crew (Isopods & Springtails)", description: "Inoculating the soil and maintaining correct humidity zones for mold control." },
      { time: "4:00 PM - 4:45 PM", title: "Hardscaping & Plant Inoculation", description: "Securing heavy rocks/driftwood and planting pothos, ferns, and bromeliads." },
      { time: "4:45 PM - 5:00 PM", title: "Lighting & Thermostat Control", description: "Setting up automated photoperiods, UVB exposure tubes, and proportional dimmers." }
    ],
    aiPetTips: [
      "Always allow a new bioactive enclosure to 'cure' for 2-4 weeks before adding your reptile. This lets clean-up crew populations establish.",
      "Molds are standard during the first two weeks of a new tank; springtails will naturally consume and manage it.",
      "Ensure proper ventilation; stagnant humid air can cause respiratory infections in reptiles."
    ],
    registrations: [],
    comments: []
  }
];

// Load Database Helper
function readDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading database file, using seed data instead:", error);
  }
  
  // Seed initial database
  writeDatabase(INITIAL_EVENTS);
  return INITIAL_EVENTS;
}

function writeDatabase(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to database:", error);
  }
}

// ----------------------------------------------------
// server-side Gemini API Integration
// ----------------------------------------------------
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// ----------------------------------------------------
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ----------------------------------------------------

// Helper to extract and verify user context from Authorization headers (Supabase or Sandbox)
async function getUserFromRequest(req: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];

  const rawUrl = process.env.VITE_SUPABASE_URL || "";
  const cleanUrl = rawUrl.includes("/rest/v1/")
    ? rawUrl.split("/rest/v1/")[0]
    : rawUrl.includes("/rest/v1")
    ? rawUrl.split("/rest/v1")[0]
    : rawUrl;
  const supabaseUrl = cleanUrl.endsWith("/") ? cleanUrl.slice(0, -1) : cleanUrl;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey && supabaseUrl !== "MY_SUPABASE_URL") {
    try {
      const { createClient } = require("@supabase/supabase-js");
      const client = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user }, error } = await client.auth.getUser(token);
      if (user && !error) {
        return {
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role || "user",
          fullName: user.user_metadata?.fullName || "Active User",
        };
      }
    } catch (err) {
      console.error("Express backend token verification failure:", err);
    }
  }

  // High-fidelity sandbox token parsing
  if (token && token.startsWith("mock-token-")) {
    // Return standard test admin user
    return {
      id: "mock-admin-id",
      email: "lilymitslal@gmail.com",
      role: "admin",
      fullName: "Lily Mits",
    };
  }

  return null;
}

// Enforce authenticated context (for comments etc)
async function requireAuth(req: any, res: any, next: any) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required. Please sign in first." });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: "Internal Auth verification error" });
  }
}

// Enforce administrative context (for creating, deleting, and managing registrations)
async function requireAdmin(req: any, res: any, next: any) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required. Please sign in." });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Access Denied. Host Desk credentials required." });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: "Internal Authorization verification error" });
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Get all events (supports search, category, and petType filters)
app.get("/api/events", (req, res) => {
  const events = readDatabase();
  const { search, category, petType } = req.query;

  let filtered = [...events];

  if (search) {
    const searchStr = (search as string).toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(searchStr) ||
        e.description.toLowerCase().includes(searchStr) ||
        e.hostName.toLowerCase().includes(searchStr) ||
        e.tags.some((t: string) => t.toLowerCase().includes(searchStr))
    );
  }

  if (category) {
    filtered = filtered.filter(
      (e) => e.category.toLowerCase() === (category as string).toLowerCase()
    );
  }

  if (petType) {
    const pType = (petType as string).toLowerCase();
    filtered = filtered.filter((e) => {
      const evPet = e.petType.toLowerCase();
      // Simple match: e.g. "dogs & cats" contains "dog"
      if (pType === "all") return true;
      if (pType === "dogs" && evPet.includes("dog")) return true;
      if (pType === "cats" && evPet.includes("cat")) return true;
      if (pType === "reptiles" && (evPet.includes("reptile") || evPet.includes("amphibian"))) return true;
      if (pType === "others" && !evPet.includes("dog") && !evPet.includes("cat") && !evPet.includes("reptile")) return true;
      return evPet.includes(pType);
    });
  }

  res.json(filtered);
});

// 2. Get Single Event by ID
app.get("/api/events/:id", (req, res) => {
  const events = readDatabase();
  const event = events.find((e: any) => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }
  res.json(event);
});

// 3. Create a New Event (Hosts)
app.post("/api/events", requireAdmin, (req, res) => {
  const events = readDatabase();
  const {
    title,
    category,
    petType,
    date,
    time,
    duration,
    locationType,
    location,
    hostName,
    hostRole,
    hostBio,
    description,
    details,
    image,
    capacity,
    tags,
    agenda,
    aiPetTips
  } = req.body;

  // Sanitization
  const cleanTitle = sanitizeInput(title);
  const cleanCategory = sanitizeInput(category || "General Education");
  const cleanPetType = sanitizeInput(petType || "All Pets");
  const cleanDate = sanitizeInput(date);
  const cleanTime = sanitizeInput(time);
  const cleanDuration = sanitizeInput(duration || "1 Hour");
  const cleanLocationType = sanitizeInput(locationType || "online");
  const cleanLocation = sanitizeInput(location || (cleanLocationType === "online" ? "Online Meeting Link" : "Interactive Field"));
  const cleanHostName = sanitizeInput(hostName);
  const cleanHostRole = sanitizeInput(hostRole || "Educator");
  const cleanHostBio = sanitizeInput(hostBio || "");
  const cleanDescription = sanitizeInput(description);
  const cleanDetails = sanitizeInput(details || cleanDescription, "markdown");
  const cleanImage = sanitizeInput(image);

  // Validation
  const titleErr = validateLength(cleanTitle, "Event Title", 5, 150);
  if (titleErr) return res.status(400).json({ error: titleErr });

  const categoryErr = validateLength(cleanCategory, "Category", 2, 50);
  if (categoryErr) return res.status(400).json({ error: categoryErr });

  const petTypeErr = validateLength(cleanPetType, "Pet Target Type", 2, 50);
  if (petTypeErr) return res.status(400).json({ error: petTypeErr });

  const dateErr = validateDate(cleanDate, false);
  if (dateErr) return res.status(400).json({ error: dateErr });

  const timeErr = validateLength(cleanTime, "Event Time", 2, 50);
  if (timeErr) return res.status(400).json({ error: timeErr });

  const durationErr = validateLength(cleanDuration, "Duration", 2, 50);
  if (durationErr) return res.status(400).json({ error: durationErr });

  const locationErr = validateLength(cleanLocation, "Location", cleanLocationType === "online" ? 0 : 3, 250);
  if (locationErr) return res.status(400).json({ error: locationErr });

  const hostNameErr = validateLength(cleanHostName, "Host Name", 3, 100);
  if (hostNameErr) return res.status(400).json({ error: hostNameErr });

  const hostRoleErr = validateLength(cleanHostRole, "Host Professional Role", 2, 100);
  if (hostRoleErr) return res.status(400).json({ error: hostRoleErr });

  const hostBioErr = validateLength(cleanHostBio, "Host Professional Bio", 5, 1000);
  if (hostBioErr) return res.status(400).json({ error: hostBioErr });

  const descErr = validateLength(cleanDescription, "Overview Description", 10, 300);
  if (descErr) return res.status(400).json({ error: descErr });

  const detailsErr = validateLength(cleanDetails, "Detailed Syllabus Curriculum", 10, 8000);
  if (detailsErr) return res.status(400).json({ error: detailsErr });

  const capacityErr = validateCapacity(capacity);
  if (capacityErr) return res.status(400).json({ error: capacityErr });

  if (cleanImage) {
    const imgErr = validateUrl(cleanImage, "Hero Banner Image URL", false);
    if (imgErr) return res.status(400).json({ error: imgErr });
  }

  // Parse structured arrays safely and sanitize their values
  const cleanTags = (Array.isArray(tags) ? tags : ["Pet Care", "Education"])
    .map((t) => sanitizeInput(String(t)))
    .filter((t) => t !== "");

  const cleanAgenda = (Array.isArray(agenda) ? agenda : []).map((item: any) => ({
    time: sanitizeInput(String(item?.time || "0:00")),
    title: sanitizeInput(String(item?.title || "Agenda Topic")),
    description: sanitizeInput(String(item?.description || "")),
  }));

  const cleanAiPetTips = (Array.isArray(aiPetTips) ? aiPetTips : ["Be patient with your pet.", "Consult a vet for specific medical advice."])
    .map((tip) => sanitizeInput(String(tip)))
    .filter((tip) => tip !== "");

  const newEvent = {
    id: `evt-${Date.now()}`,
    title: cleanTitle,
    category: cleanCategory,
    petType: cleanPetType,
    date: cleanDate,
    time: cleanTime,
    duration: cleanDuration,
    locationType: cleanLocationType,
    location: cleanLocation,
    hostName: cleanHostName,
    hostRole: cleanHostRole,
    hostBio: cleanHostBio,
    description: cleanDescription,
    details: cleanDetails,
    image: cleanImage || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1200&auto=format&fit=crop&q=80",
    capacity: Number(capacity) || 100,
    tags: cleanTags,
    agenda: cleanAgenda,
    aiPetTips: cleanAiPetTips,
    registrations: [],
    comments: []
  };

  events.push(newEvent);
  writeDatabase(events);
  res.status(201).json(newEvent);
});

// 4. Delete an Event
app.delete("/api/events/:id", requireAdmin, (req, res) => {
  const events = readDatabase();
  const index = events.findIndex((e: any) => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Event not found" });
  }
  events.splice(index, 1);
  writeDatabase(events);
  res.json({ success: true, message: "Event deleted successfully" });
});

// 5. Register an Attendee for an Event
app.post("/api/events/:id/register", (req, res) => {
  const events = readDatabase();
  const eventIndex = events.findIndex((e: any) => e.id === req.params.id);
  if (eventIndex === -1) {
    return res.status(404).json({ error: "Event not found" });
  }

  const { name, email, petName, petType, petAge, specialRequirements } = req.body;

  // Sanitization
  const cleanName = sanitizeInput(name);
  const cleanEmail = sanitizeInput(email);
  const cleanPetName = sanitizeInput(petName);
  const cleanPetType = sanitizeInput(petType || "N/A");
  const cleanPetAge = sanitizeInput(petAge || "Adult");
  const cleanSpecialReq = sanitizeInput(specialRequirements);

  // Validation
  const nameErr = validateLength(cleanName, "Full Name", 2, 80);
  if (nameErr) return res.status(400).json({ error: nameErr });

  const emailErr = validateEmail(cleanEmail);
  if (emailErr) return res.status(400).json({ error: emailErr });

  if (cleanPetName) {
    const petNameErr = validateLength(cleanPetName, "Pet Name", 1, 50);
    if (petNameErr) return res.status(400).json({ error: petNameErr });
  }

  if (cleanSpecialReq) {
    const specialReqErr = validateLength(cleanSpecialReq, "Special requirements", 0, 1000);
    if (specialReqErr) return res.status(400).json({ error: specialReqErr });
  }

  const event = events[eventIndex];

  // Check capacity
  if (event.registrations.length >= event.capacity) {
    return res.status(400).json({ error: "This event has reached its maximum capacity." });
  }

  // Check duplicate email registration
  const duplicate = event.registrations.find((r: any) => r.email.toLowerCase() === cleanEmail.toLowerCase());
  if (duplicate) {
    return res.status(400).json({ error: "You are already registered for this event." });
  }

  const newRegistration = {
    id: `reg-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    petName: cleanPetName || "None",
    petType: cleanPetType,
    petAge: cleanPetAge,
    specialRequirements: cleanSpecialReq || "",
    registeredAt: new Date().toISOString(),
    checkedIn: false
  };

  event.registrations.push(newRegistration);
  events[eventIndex] = event;
  writeDatabase(events);

  res.status(201).json({
    success: true,
    registration: newRegistration,
    eventTitle: event.title,
    eventDate: event.date,
    eventTime: event.time,
    eventLocation: event.location
  });
});

// 6. Post a Comment / Ask Publicly
app.post("/api/events/:id/comments", requireAuth, (req, res) => {
  const events = readDatabase();
  const eventIndex = events.findIndex((e: any) => e.id === req.params.id);
  if (eventIndex === -1) {
    return res.status(404).json({ error: "Event not found" });
  }

  const { name, role, text } = req.body;

  // Sanitization
  const cleanName = sanitizeInput(name);
  const cleanRole = sanitizeInput(role || "Attendee");
  const cleanText = sanitizeInput(text);

  // Validation
  const nameErr = validateLength(cleanName, "Name", 1, 80);
  if (nameErr) return res.status(400).json({ error: nameErr });

  const roleErr = validateLength(cleanRole, "Role", 1, 50);
  if (roleErr) return res.status(400).json({ error: roleErr });

  const textErr = validateLength(cleanText, "Comment text", 1, 500);
  if (textErr) return res.status(400).json({ error: textErr });

  const newComment = {
    id: `com-${Date.now()}`,
    name: cleanName,
    role: cleanRole,
    text: cleanText,
    timestamp: new Date().toISOString()
  };

  const event = events[eventIndex];
  event.comments.push(newComment);
  events[eventIndex] = event;
  writeDatabase(events);

  res.status(201).json(newComment);
});

// 7. Check-in or Remove Registrant (Host Admin Utilities)
app.post("/api/events/:id/registrations/:regId/checkin", requireAdmin, (req, res) => {
  const events = readDatabase();
  const eventIndex = events.findIndex((e: any) => e.id === req.params.id);
  if (eventIndex === -1) {
    return res.status(404).json({ error: "Event not found" });
  }

  const event = events[eventIndex];
  const registration = event.registrations.find((r: any) => r.id === req.params.regId);
  if (!registration) {
    return res.status(404).json({ error: "Registration not found" });
  }

  registration.checkedIn = !registration.checkedIn; // Toggle check-in
  events[eventIndex] = event;
  writeDatabase(events);

  res.json({ success: true, registration });
});

app.delete("/api/events/:id/registrations/:regId", requireAdmin, (req, res) => {
  const events = readDatabase();
  const eventIndex = events.findIndex((e: any) => e.id === req.params.id);
  if (eventIndex === -1) {
    return res.status(404).json({ error: "Event not found" });
  }

  const event = events[eventIndex];
  const regIndex = event.registrations.findIndex((r: any) => r.id === req.params.regId);
  if (regIndex === -1) {
    return res.status(404).json({ error: "Registration not found" });
  }

  event.registrations.splice(regIndex, 1);
  events[eventIndex] = event;
  writeDatabase(events);

  res.json({ success: true, message: "Registration cancelled by host." });
});

// 8. AI Event Generator - Uses Gemini API
app.post("/api/ai/generate-event", requireAdmin, async (req, res) => {
  const { idea, petType } = req.body;
  if (!idea) {
    return res.status(400).json({ error: "An event idea is required to generate event." });
  }

  const client = getGeminiClient();

  if (!client) {
    // Graceful fallback if Gemini API Key is missing or invalid
    console.log("No Gemini API key found. Providing high-quality template event response.");
    const fallbackResponse = {
      title: `Expert Seminar: ${idea.charAt(0).toUpperCase() + idea.slice(1)}`,
      category: "Specialized Education",
      petType: petType || "All Pets",
      duration: "1.5 Hours",
      description: `A professionally curated educational workshop centered around the theme: "${idea}". This session is structured to give practical, actionable steps for pet caretakers of all skill levels.`,
      details: `### About This Session\nWelcome to this AI-co-designed expert educational event on **${idea}**.\n\n### What We Will Explore\n- Hands-on practical safety guidelines for ${petType || "your pet"}.\n- Modern science-backed research on pet longevity and well-being.\n- Avoidable household mistakes and proactive vet-aligned prevention.\n\n*Note: This event description was simulated due to the server running in offline-local mode without a Gemini key. Configure your GEMINI_API_KEY for dynamic generative planning.*`,
      hostName: "Dr. Avery Vance, DVM",
      hostRole: "Pet Care Academy Senior Director",
      hostBio: "Dr. Avery Vance has spent over a decade leading digital veterinary curriculum development and promoting positive training structures.",
      tags: ["AI Planned", petType || "Pets", "Education", "Interactive"],
      agenda: [
        { time: "0:00 - 0:30", title: "Introduction & Contextual Mapping", description: "Analyzing the fundamental challenges and historical perspectives on the topic." },
        { time: "0:30 - 1:15", title: "Core Methodologies & Real-world Scenarios", description: "Step-by-step guidance, equipment setups, and proactive prevention strategies." },
        { time: "1:15 - 1:30", title: "Closing Expert Auditing & Direct Q&A", description: "Solving specific problems voiced by attendees regarding their home habitats." }
      ],
      aiPetTips: [
        "Always observe baseline activity levels; sudden drops in activity are often the first signs of discomfort or silent pain.",
        "Ensure your veterinarian is always consulted before adding any supplemental powders or custom herbs to their diet.",
        "Interactive mental puzzles (such as hide-and-seek scent setups) provide equal exhaustion to physical running."
      ]
    };
    return res.json(fallbackResponse);
  }

  try {
    const prompt = `You are a world-class veterinary educator and pet care experience designer. 
    Design a premium, highly detailed pet care educational workshop based on the user's brief idea.
    
    Brief Idea: "${idea}"
    Target Pet Category: "${petType || "All Pets"}"

    Generate a complete, cohesive event design in strict JSON format. Ensure all values are professionally written, engaging, and scientifically accurate. Use the structure provided below.
    
    Response format must be a JSON object containing EXACTLY these keys:
    {
      "title": "Engaging display title",
      "category": "e.g. Nutrition, Emergency Medicine, Behavioral Science, Rehab, etc.",
      "petType": "e.g. Cats, Dogs, Puppies, Exotic Lizards, etc.",
      "duration": "e.g. 2 Hours, 1.5 Hours",
      "description": "A punchy, single-paragraph overview under 150 characters",
      "details": "Rich markdown describing why people should attend, what they'll learn, special instructions, etc.",
      "hostName": "A realistic distinguished professional name (e.g. Dr. Jordan Reed, DVM)",
      "hostRole": "Vastly credible role (e.g. Certified Avian Behavior Consultant)",
      "hostBio": "Short bio emphasizing their research, passion, or field achievements",
      "tags": ["3 to 5 highly relevant tag words"],
      "agenda": [
        { "time": "e.g. 10:00 AM - 10:30 AM", "title": "Segment Name", "description": "Short explanation of what happens" },
        ... generate exactly 3 or 4 timeline blocks
      ],
      "aiPetTips": [
        "Include exactly 3 scientifically sound, highly actionable, expert pet tips on this event's topic that any owner can do at home."
      ]
    }`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            petType: { type: Type.STRING },
            duration: { type: Type.STRING },
            description: { type: Type.STRING },
            details: { type: Type.STRING },
            hostName: { type: Type.STRING },
            hostRole: { type: Type.STRING },
            hostBio: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            agenda: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["time", "title", "description"]
              }
            },
            aiPetTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "category", "petType", "duration", "description", "details", "hostName", "hostRole", "hostBio", "tags", "agenda", "aiPetTips"]
        }
      }
    });

    const text = response.text || "";
    const parsed = JSON.parse(text);
    res.json(parsed);

  } catch (error) {
    console.error("Gemini event generation failed:", error);
    res.status(500).json({ error: "Gemini failed to generate the event. Please try again." });
  }
});

// 9. Interactive AI Copilot on the Event Details Page
app.post("/api/ai/ask-expert", async (req, res) => {
  const { eventId, message, chatHistory } = req.body;
  if (!eventId || !message) {
    return res.status(400).json({ error: "Event ID and message are required." });
  }

  const events = readDatabase();
  const event = events.find((e: any) => e.id === eventId);
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  const client = getGeminiClient();

  if (!client) {
    // Safe offline simulator
    const fallbacks = [
      `That is an excellent question regarding ${event.title}! As an expert in pet care, I highly suggest observing your pet's baseline behaviors first and contacting your veterinarian before making any immediate adjustments.`,
      `Regarding your inquiry about "${message}": For ${event.petType}, it is absolutely vital to verify that their microclimate or dietary balances are checked daily. During our upcoming session, we will go into detail about exactly this!`,
      `I love that you are thinking ahead! The best strategy is to prepare a comfortable, secure space at home where your pet feels protected while you implement any new routines. I look forward to speaking more during the event.`
    ];
    const text = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return res.json({ text: `${text}\n\n*(This response was simulated. Connect a real GEMINI_API_KEY in Settings to get dynamic, context-aware answers!)*` });
  }

  try {
    // Build context
    const historyPrompt = chatHistory
      ? chatHistory.map((h: any) => `${h.sender === "user" ? "User" : "Expert"}: ${h.text}`).join("\n")
      : "";

    const context = `You are the AI Pet Expert Co-Host for an upcoming educational event called "${event.title}".
    The event is led by ${event.hostName} (${event.hostRole}) who is a specialist in ${event.category}.
    
    About the Event:
    - Topic / Description: ${event.description}
    - Deep Details: ${event.details}
    - Target Animals: ${event.petType}
    - Host Bio: ${event.hostBio}
    - AI Recommended Tips: ${event.aiPetTips.join("; ")}

    Your job is to answer user questions about this specific event, its topic, or general questions about ${event.petType} related to this workshop's subject.
    Be extremely warm, professional, scientific yet easy to understand, and highly supportive. Offer safe, veterinarian-approved suggestions. Always state clearly if a vet visit is recommended for clinical issues.
    
    Here is the chat history:
    ${historyPrompt}

    User's New Question: "${message}"

    Respond directly in a supportive, expert tone. Keep the answer under 4-5 sentences, clear, concise, and scannable. Do not start with "Co-Host:" or "Expert:".`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: context,
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("Gemini co-host chat failed:", error);
    res.status(500).json({ error: "Could not fetch AI Expert advice. Please try again." });
  }
});

// Vite Middleware integration for Full-Stack Hot Module/Refresh Support
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA routing fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Pet Care Events Backend] Server running on http://0.0.0.0:${PORT}`);
  });
};

startServer();
