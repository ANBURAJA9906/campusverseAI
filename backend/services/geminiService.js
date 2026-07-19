// Gemini Service
// Thin wrapper around @google/genai used by IntentAgent (query understanding)
// and the Admin Announcement endpoint (summarization). Every method fails soft:
// if no provider is configured, or the call errors/times out, callers get `null`
// back and are expected to fall back to the existing rule-based logic. This
// keeps the demo resilient even with no network / no credentials on stage.
//
// TWO INTERCHANGEABLE PROVIDERS — same code path, same @google/genai client,
// just different construction:
//
//   1. Gemini Developer API (AI Studio API key) — the original setup.
//      Set GEMINI_API_KEY. Billed against AI Studio's free tier / your own
//      pay-as-you-go billing.
//
//   2. Vertex AI (Google Cloud) — draws from a Google Cloud Billing account,
//      which is what a $300 free-trial credit applies to. Set
//      GOOGLE_CLOUD_PROJECT (+ optionally GOOGLE_CLOUD_LOCATION) and
//      authenticate via Application Default Credentials — either
//      `gcloud auth application-default login` locally, or
//      GOOGLE_APPLICATION_CREDENTIALS pointing at a service-account JSON key.
//      See backend/.env.example for the full setup checklist.
//
// Which one is used is auto-detected (Vertex wins if GOOGLE_CLOUD_PROJECT is
// set), or forced explicitly with GEMINI_PROVIDER=vertex|studio.

import { GoogleGenAI, Type } from '@google/genai';

// 'gemini-flash-latest' is Google's alias that always points at the current
// stable Flash release — it gets hot-swapped by Google as models are
// deprecated, so we don't hardcode a specific version that can 404 out from
// under new API keys (which is exactly what happened with gemini-2.5-flash).
// Works unchanged on both providers.
const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const TIMEOUT_MS = 15000;

// Nano Banana image model. Configurable via env since Google rotates image
// model versions too (e.g. gemini-2.5-flash-image -> gemini-3.1-flash-image)
// — same reasoning as the text MODEL alias above.
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const IMAGE_TIMEOUT_MS = 20000; // image generation is slower than text

// true  -> use Vertex AI / Google Cloud (spends Cloud Billing credit, e.g.
//          a $300 free trial)
// false -> use the Gemini Developer API / AI Studio key
function resolveProvider() {
  const forced = (process.env.GEMINI_PROVIDER || '').toLowerCase();
  if (forced === 'vertex') return 'vertex';
  if (forced === 'studio') return 'studio';
  // Auto-detect: prefer Vertex if a Cloud project is configured, since
  // that's the explicit signal someone wants to spend Cloud credit.
  return process.env.GOOGLE_CLOUD_PROJECT ? 'vertex' : 'studio';
}

let client = null;
let cachedProvider = null;
function getClient() {
  const provider = resolveProvider();

  // Rebuild if the resolved provider changed (e.g. env reloaded/tests) or
  // isn't configured at all — never hand back a client for the wrong mode.
  if (client && cachedProvider === provider) return client;

  if (provider === 'vertex') {
    if (!process.env.GOOGLE_CLOUD_PROJECT) return null;
    console.log(`[geminiService] Creating Vertex AI client | project=${process.env.GOOGLE_CLOUD_PROJECT} | model=${MODEL}`);
    client = new GoogleGenAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
    });
  } else {
    if (!process.env.GEMINI_API_KEY) return null;
    const keyPrefix = process.env.GEMINI_API_KEY.slice(0, 8);
    console.log(`[geminiService] Creating AI Studio client | key prefix: "${keyPrefix}" | model: ${MODEL}`);
    // Gemini AI Studio keys always start with "AIza". Warn if the key
    // looks wrong so it is immediately obvious in the server logs.
    if (!process.env.GEMINI_API_KEY.startsWith('AIza')) {
      console.warn('[geminiService] WARNING: GEMINI_API_KEY does not start with "AIza" — this may not be a valid AI Studio key. Get a fresh key at https://aistudio.google.com/apikey');
    }
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  cachedProvider = provider;
  return client;
}

export function isGeminiAvailable() {
  const provider = resolveProvider();
  return provider === 'vertex'
    ? Boolean(process.env.GOOGLE_CLOUD_PROJECT)
    : Boolean(process.env.GEMINI_API_KEY);
}

// Lets the frontend / admin overview show which billing path is active —
// handy for confirming Cloud credit is actually being spent, not the AI
// Studio key.
export function getGeminiProviderInfo() {
  const provider = resolveProvider();
  return {
    provider,
    configured: isGeminiAvailable(),
    project: provider === 'vertex' ? (process.env.GOOGLE_CLOUD_PROJECT || null) : null,
    location: provider === 'vertex' ? (process.env.GOOGLE_CLOUD_LOCATION || 'us-central1') : null
  };
}

// Races a promise against a timeout so a slow/hanging API call never blocks
// the chat response (important for a live demo).
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini request timed out')), ms))
  ]);
}

const INTENT_VALUES = [
  'JOIN_CLUB',
  'CAMPUS_UPDATES',
  'EXAM_PREP',
  'PLACEMENT_PREP',
  'HACKATHON_DISCOVERY',
  'NAVIGATION',
  'PROJECT_ASSISTANT',
  'UNKNOWN'
];

const intentSchema = {
  type: Type.OBJECT,
  properties: {
    intent: {
      type: Type.STRING,
      enum: INTENT_VALUES,
      description: 'The single best-matching student intent for this campus assistant query.'
    },
    confidence: {
      type: Type.NUMBER,
      description: 'Model confidence in the chosen intent, from 0 to 1.'
    },
    entities: {
      type: Type.OBJECT,
      properties: {
        clubName: { type: Type.STRING, description: 'Club the student wants to join, e.g. "AI Club", "Coding Club", "WebDev Club".' },
        subject: { type: Type.STRING, description: 'Academic subject the student is preparing for, e.g. "DBMS".' },
        timeline: { type: Type.STRING, description: 'When the exam/deadline is, e.g. "next week".' },
        subIntent: {
          type: Type.STRING,
          enum: ['TEAMMATE_MATCHING', 'PROJECT_IDEAS', 'GENERAL_DISCOVERY'],
          description: 'For HACKATHON_DISCOVERY only: what the student specifically wants.'
        },
        destination: { type: Type.STRING, description: 'Navigation target, e.g. "Programming Lab".' },
        source: { type: Type.STRING, description: 'Navigation starting point, e.g. "Hostel", "Main Gate".' },
        topic: { type: Type.STRING, description: 'Project/assistant topic for general project help requests.' }
      }
    }
  },
  required: ['intent', 'confidence', 'entities']
};

export function getClientOrThrow() {
  const provider = resolveProvider();
  if (provider === 'vertex') {
    if (!process.env.GOOGLE_CLOUD_PROJECT) {
      throw new Error('Vertex AI provider selected, but GOOGLE_CLOUD_PROJECT environment variable is missing.');
    }
  } else {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured in environment variables (GEMINI_API_KEY is missing).');
    }
  }

  const ai = getClient();
  if (!ai) {
    throw new Error('Failed to initialize Gemini API client.');
  }
  return ai;
}

/**
 * Classifies a student's chat query into one of CampusVerse's known intents
 * using Gemini structured output. Throws descriptive errors if the Gemini API call fails.
 */
export async function classifyIntent(query, studentProfile) {
  const ai = getClientOrThrow();

  const prompt = `You are the Intent Detection Agent inside CampusVerse AI, a campus assistant for student "${studentProfile?.name || 'a student'}" (department: ${studentProfile?.department || 'unknown'}, year: ${studentProfile?.year || 'unknown'}).

Classify the student's message into exactly one intent and extract any relevant entities. Only fill entity fields you are confident about from the message itself; leave others blank.

Student message: "${query}"`;

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: intentSchema,
          temperature: 0.1
        }
      }),
      TIMEOUT_MS
    );

    const parsed = JSON.parse(response.text);
    if (!INTENT_VALUES.includes(parsed.intent)) return null;
    return {
      intent: parsed.intent,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
      entities: parsed.entities || {}
    };
  } catch (error) {
    console.error('[geminiService] classifyIntent failed:', error.message);
    console.log('--- API Error ---');
    console.error(error);
    console.log('-----------------');
    throw error;
  }
}

/**
 * Generates a general response from Gemini using retrieved campus knowledge base context.
 */
export async function generateGeneralResponse(query, context = '') {
  const ai = getClientOrThrow();

  const prompt = `You are a helpful campus assistant. Answer the student's question based on the provided campus database context. If the context is empty or doesn't contain the answer, use your own general knowledge to answer the question. Do NOT say "The information is unavailable in the campus database." or similar fallback messages; just answer the question directly.

Campus Database Context:
${context || 'No relevant campus data exists.'}

Student's Question: "${query}"`;

  // Print debug logs for prompt
  console.log('--- Prompt sent to Gemini ---');
  console.log(prompt);
  console.log('-----------------------------');

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          temperature: 0.7
        }
      }),
      TIMEOUT_MS
    );

    const responseText = response.text?.trim();

    // Print debug logs for response
    console.log('--- Gemini API Response ---');
    console.log(responseText);
    console.log('---------------------------');

    return responseText;
  } catch (error) {
    console.error('[geminiService] generateGeneralResponse failed:', error.message);
    console.log('--- API Error ---');
    console.error(error);
    console.log('-----------------');
    throw error;
  }
}


/**
 * Generates a Freshers' Welcome Party poster image using Gemini's image
 * model (marketed as "Nano Banana"). Returns { mimeType, base64 } on
 * success, or null (never throws) so the caller can show a clear "AI image
 * generation unavailable" message instead of crashing.
 */
export async function generateWelcomePoster({ eventName, date, venue, theme }) {
  const ai = getClient();
  if (!ai) return null;

  const prompt = `Design a vibrant, professional college "Freshers' Welcome Party" poster.
Event name: ${eventName || "Freshers' Welcome Party"}
Date: ${date || 'To be announced'}
Venue: ${venue || 'College Main Auditorium'}
Visual theme/mood: ${theme || 'colorful, energetic, modern campus celebration'}
Include tasteful poster-style typography for the event name. Do not include any real photos of people; use illustrated/graphic style artwork only.`;

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: prompt
      }),
      IMAGE_TIMEOUT_MS
    );

    const parts = response?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(p => p.inlineData);
    if (!imagePart) return null;

    return {
      mimeType: imagePart.inlineData.mimeType || 'image/png',
      base64: imagePart.inlineData.data
    };
  } catch (error) {
    console.error('[geminiService] generateWelcomePoster failed:', error.message);
    return null;
  }
}

/**
 * Extracts a short, student-facing highlight (deadline/venue/what-it-is) for
 * a batch of campus events of any type (hackathon, workshop, orientation,
 * placement_drive, etc). Returns a Map<eventId, highlight> on success, or
 * null (never throws) so the caller falls back to a naive per-event
 * sentence built from the raw fields.
 */
export async function extractEventHighlights(events) {
  const ai = getClient();
  if (!ai || events.length === 0) return null;

  const eventListText = events
    .map(e => `- id: ${e.id} | name: "${e.name}" | type: ${e.type} | date: ${e.date} | deadline: ${e.deadline} | location: ${e.location} | description: ${e.description}`)
    .join('\n');

  const prompt = `You are the Event Intelligence Agent inside CampusVerse AI. For each campus event below, write one short student-facing highlight sentence (max 20 words) that calls out what it is and, if relevant, the registration deadline or venue — whichever detail matters most for that event type.

Events:
${eventListText}

Return only a JSON array, no preamble, in this exact shape: [{"id": "<event id>", "highlight": "<sentence>"}, ...] — one entry per event, in any order.`;

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      }),
      TIMEOUT_MS
    );

    const parsed = JSON.parse(response.text);
    if (!Array.isArray(parsed)) return null;

    const highlights = new Map();
    for (const item of parsed) {
      if (item?.id && typeof item.highlight === 'string') {
        highlights.set(item.id, item.highlight.trim());
      }
    }
    return highlights.size > 0 ? highlights : null;
  } catch (error) {
    console.error('[geminiService] extractEventHighlights failed, falling back to naive highlights:', error.message);
    return null;
  }
}

/**
 * Generates a real 1-2 sentence summary of an admin announcement.
 * Returns null (never throws) so the caller can fall back to the naive
 * word-slice summary.
 */
export async function summarizeAnnouncement(title, content) {
  const ai = getClient();
  if (!ai) return null;

  const prompt = `Summarize the following campus announcement in one short, student-friendly sentence (max 25 words). Do not repeat the title verbatim. Return only the summary sentence, no preamble.

Title: ${title}
Content: ${content}`;

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: { temperature: 0.3 }
      }),
      TIMEOUT_MS
    );
    const text = response.text?.trim();
    return text || null;
  } catch (error) {
    console.error('[geminiService] summarizeAnnouncement failed, falling back to naive summary:', error.message);
    return null;
  }
}
