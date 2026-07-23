// Shared content type definitions for FlightPath Academy

export type Difficulty = "Beginner" | "Foundational" | "Intermediate" | "Advanced";

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "callout"; variant: "info" | "warning" | "tip"; title: string; body: string }
  | { type: "diagram"; diagramKey: string; caption: string };

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ModuleContent {
  id: number;
  title: string;
  shortTitle: string;
  category: string;
  estimatedMinutes: number;
  difficulty: Difficulty;
  xpReward: number;
  prerequisites: number[];
  tagline: string;
  whyItMatters: string;
  sections: {
    heading: string;
    blocks: ContentBlock[];
  }[];
  commonMistake: { title: string; body: string };
  tryItInSim: { title: string; steps: string[] };
  keyTakeaways: string[];
  quiz: QuizQuestion[];
}

export interface GlossaryTerm {
  id: string;
  term: string;
  category: "Aerodynamics" | "Instruments" | "Navigation" | "Communications" | "Weather" | "Procedures" | "General";
  definition: string;
  whyItMatters: string;
  moduleId: number | null;
}

export interface Checklist {
  id: string;
  title: string;
  aircraft: string;
  description: string;
  sections: {
    name: string;
    items: { text: string; detail?: string }[];
  }[];
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}
