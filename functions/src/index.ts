import { onCall, HttpsError } from "firebase-functions/v2/https";
import { GoogleGenerativeAI, SchemaType as Type } from "@google/generative-ai";
import OpenAI from "openai";
import { defineSecret } from "firebase-functions/params";

// Using defineSecret for secure environment variables in Cloud Functions
const geminiApiKey = defineSecret("GEMINI_API_KEY");
const openaiApiKey = defineSecret("OPENAI_API_KEY");

function cleanJson(text: string): string {
  let clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const firstBrace = clean.indexOf("{");
  const lastBrace = clean.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }
  return clean;
}

const sermonSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    introduction: { type: Type.STRING },
    points: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
        },
        required: ["title", "content"],
      },
    },
    verses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    applications: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    conclusion: { type: Type.STRING },
    prayer: { type: Type.STRING },
    illustration: { type: Type.STRING },
  },
  required: [
    "title",
    "introduction",
    "points",
    "verses",
    "applications",
    "conclusion",
    "prayer",
    "illustration",
  ],
};

const openaiSermonSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    introduction: { type: "string" },
    points: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" },
        },
        required: ["title", "content"],
        additionalProperties: false,
      },
    },
    verses: {
      type: "array",
      items: { type: "string" },
    },
    applications: {
      type: "array",
      items: { type: "string" },
    },
    conclusion: { type: "string" },
    prayer: { type: "string" },
    illustration: { type: "string" },
  },
  required: [
    "title",
    "introduction",
    "points",
    "verses",
    "applications",
    "conclusion",
    "prayer",
    "illustration",
  ],
  additionalProperties: false,
};

export const generateSermon = onCall({ secrets: [geminiApiKey, openaiApiKey], cors: true }, async (request) => {
  const params = request.data;
  const geminiKey = geminiApiKey.value();
  const openaiKey = openaiApiKey.value();

  const prompt = `Generate a structured sermon based on the following details:

Topic: ${params.topic}
Bible Passage: ${params.biblePassage}
Audience: ${params.audience}
Target Length: ${params.length}
Denomination/Style: ${params.denomination}

Return JSON with:
- title
- introduction
- 3 sermon points
- supporting Bible verses (include the full text of the verses)
- applications
- conclusion
- closing prayer
- a relevant sermon illustration or story
`;

  console.log(`Backend: AI Provider Check - OpenAI: [${!!openaiKey}], Gemini: [${!!geminiKey}]`);

  try {
    if (openaiKey && openaiKey.trim() !== "" && openaiKey !== "placeholder") {
      console.log("Backend: Using OpenAI provider...");
      const openai = new OpenAI({ apiKey: openaiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000, // Ensure enough room for a full sermon
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "sermon",
            strict: true,
            schema: openaiSermonSchema,
          },
        },
      });

      const text = response.choices[0].message.content;
      if (!text) throw new Error("Empty response from OpenAI");
      
      try {
        return JSON.parse(cleanJson(text));
      } catch (parseErr) {
        console.error("OpenAI JSON Parse Error. Raw text:", text);
        throw parseErr;
      }
    } 
    
    if (geminiKey && geminiKey.trim() !== "" && geminiKey !== "placeholder") {
      console.log("Backend: Using Gemini provider...");
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const response = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: sermonSchema as any,
        },
      });

      const text = response.response.text();
      if (!text) throw new Error("Empty response from Gemini");
      
      try {
        return JSON.parse(cleanJson(text));
      } catch (parseErr) {
        console.error("Gemini JSON Parse Error. Raw text:", text);
        throw parseErr;
      }
    }
    
    throw new HttpsError("unauthenticated", "No AI provider is correctly configured (missing or invalid API keys)");
  } catch (err: any) {
    console.error("Backend AI Error:", err);
    throw new HttpsError("internal", `AI Generation failed: ${err.message}`);
  }
});

export const repurposeSermon = onCall({ secrets: [geminiApiKey, openaiApiKey], cors: true }, async (request) => {
  const { sermon, target } = request.data;
  const geminiKey = geminiApiKey.value();
  const openaiKey = openaiApiKey.value();

  const prompts = {
    social:
      "Convert this sermon into 5 engaging social media posts. Return JSON with a 'posts' array containing objects with 'content' and 'visualIdea'.",
    blog: "Convert this sermon into a structured blog article using Markdown (headers, bullet points, etc). Return JSON with 'content' (a single markdown string) and 'visualIdea'.",
    devotional:
      "Convert this sermon into a 5-minute devotional reading using Markdown. Return JSON with 'content' (a single markdown string) and 'visualIdea'.",
    discussion:
      "Generate 10 small group discussion questions from this sermon. Return plain text.",
  };

  const sermonContent =
    sermon.fullText ||
    `${sermon.introduction ?? ""} ${
      sermon.points?.map((p: any) => p.content).join(" ") ?? ""
    } ${sermon.conclusion ?? ""}`;

  const prompt = `${prompts[target as keyof typeof prompts]}

Sermon Title: ${sermon.title}
Sermon Content: ${sermonContent}`;

  const isJson = target === "social" || target === "blog" || target === "devotional";

  console.log(`Backend: AI Repurpose Check - OpenAI: [${!!openaiKey}], Gemini: [${!!geminiKey}]`);

  try {
    if (openaiKey && openaiKey.trim() !== "" && openaiKey !== "placeholder") {
      console.log("Backend: Using OpenAI for repurpose...");
      const openai = new OpenAI({ apiKey: openaiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 3000, // Increased for blog/devotional
        ...(isJson ? { response_format: { type: "json_object" } } : {}),
      });

      const text = response.choices[0].message.content;
      if (!text) throw new Error("No response from OpenAI");
      
      try {
        return isJson ? JSON.parse(cleanJson(text)) : text;
      } catch (parseErr) {
        console.error("OpenAI Repurpose JSON Parse Error. Raw text:", text);
        throw parseErr;
      }
    } 
    
    if (geminiKey && geminiKey.trim() !== "" && geminiKey !== "placeholder") {
      console.log("Backend: Using Gemini for repurpose...");
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const response = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: isJson ? { responseMimeType: "application/json" } : undefined,
      });

      const text = response.response.text();
      if (!text) throw new Error("No response from Gemini");
      
      try {
        return isJson ? JSON.parse(cleanJson(text)) : text;
      } catch (parseErr) {
        console.error("Gemini Repurpose JSON Parse Error. Raw text:", text);
        throw parseErr;
      }
    }
    
    throw new HttpsError("unauthenticated", "No AI provider configured");
  } catch (err: any) {
    console.error("Backend Repurpose Error:", err);
    throw new HttpsError("internal", `Repurpose failed: ${err.message}`);
  }
});

export const generateSermonImage = onCall({ secrets: [geminiApiKey, openaiApiKey], cors: true }, async (request) => {
  const { prompt } = request.data;
  const geminiKey = geminiApiKey.value();
  const openaiKey = openaiApiKey.value();

  console.log(`Backend: AI Image Check - OpenAI: [${!!openaiKey}], Gemini: [${!!geminiKey}]`);

  try {
    if (openaiKey && openaiKey.trim() !== "" && openaiKey !== "placeholder") {
      console.log("Backend: Using OpenAI for image generation...");
      const openai = new OpenAI({ apiKey: openaiKey });
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Create a professional sermon image: ${prompt}`,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
      });

      const b64 = response.data?.[0]?.b64_json;
      if (!b64) throw new Error("No image from OpenAI");
      return `data:image/png;base64,${b64}`;
    } 
    
    if (geminiKey && geminiKey.trim() !== "" && geminiKey !== "placeholder") {
      console.log("Backend: Using Gemini for image generation...");
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Note: Using flash for image generation if supported or another model
      const response = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: `Create a professional sermon image: ${prompt}` }] }],
      });

      // Handle Gemini response for images (if using a model that supports it)
      // This part might need adjustment based on how Gemini handles images
      const text = response.response.text();
      // Simplified for now, assuming standard text response if no image model
      return text;
    }
    
    throw new HttpsError("unauthenticated", "No AI provider configured");
  } catch (err: any) {
    console.error("Backend Image Error:", err);
    throw new HttpsError("internal", `Image generation failed: ${err.message}`);
  }
});
