import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import type { Sermon } from "../types";

/* ---------- GENERATE SERMON ---------- */

export const generateSermon = async (params: {
  topic: string;
  biblePassage: string;
  audience: string;
  length: string;
  denomination: string;
}): Promise<Partial<Sermon>> => {
  try {
    const generateSermonFn = httpsCallable<any, Partial<Sermon>>(functions, "generateSermon");
    const result = await generateSermonFn(params);
    return result.data;
  } catch (error) {
    console.error("Error generating sermon:", error);
    throw new Error("Failed to generate sermon via secure backend");
  }
};

/* ---------- REPURPOSE SERMON ---------- */

export const repurposeSermon = async (
  sermon: Sermon,
  target: "social" | "blog" | "devotional" | "discussion",
): Promise<string | Record<string, unknown>> => {
  try {
    const repurposeSermonFn = httpsCallable<{ sermon: Sermon, target: string }, any>(functions, "repurposeSermon");
    const result = await repurposeSermonFn({ sermon, target });
    return result.data;
  } catch (error) {
    console.error("Error repurposing sermon:", error);
    throw new Error("Failed to repurpose sermon via secure backend");
  }
};

/* ---------- GENERATE SERMON IMAGE ---------- */

export const generateSermonImage = async (prompt: string): Promise<string> => {
  try {
    const generateSermonImageFn = httpsCallable<{ prompt: string }, string>(functions, "generateSermonImage");
    const result = await generateSermonImageFn({ prompt });
    return result.data;
  } catch (error) {
    console.error("Error generating sermon image:", error);
    throw new Error("Failed to generate sermon image via secure backend");
  }
};
