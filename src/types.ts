export interface SermonPoint {
  title: string;
  content: string;
}

export interface Sermon {
  id?: string;
  userId: string;
  topic: string;
  biblePassage: string;
  audience: string;
  length: string;
  denomination: string;
  title: string;
  introduction: string;
  points: SermonPoint[];
  verses: string[];
  applications: string[];
  conclusion: string;
  prayer: string;
  illustration?: string;
  fullText: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  sermonCount: number;
  feedbackSubmitted?: boolean;
  createdAt: string;
}

export type GenerationStatus = "idle" | "loading" | "success" | "error";
