export interface Registration {
  id: string;
  name: string;
  email: string;
  petName: string;
  petType: string;
  petAge: string;
  specialRequirements: string;
  registeredAt: string;
  checkedIn: boolean;
}

export interface Comment {
  id: string;
  name: string;
  role: string; // e.g. "Attendee", "Host", "Veterinarian", "Trainer"
  text: string;
  timestamp: string;
}

export interface AgendaItem {
  time: string;
  title: string;
  description: string;
}

export interface PetEvent {
  id: string;
  title: string;
  category: string;
  petType: string;
  date: string;
  time: string;
  duration: string;
  locationType: "online" | "in-person" | "hybrid";
  location: string;
  hostName: string;
  hostRole: string;
  hostBio: string;
  description: string;
  details: string;
  image: string;
  capacity: number;
  tags: string[];
  agenda: AgendaItem[];
  aiPetTips: string[];
  registrations: Registration[];
  comments: Comment[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "expert";
  text: string;
  timestamp: string;
}
