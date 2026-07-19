// Intent Detection Agent
// Parses user query to identify primary intent and extract key entities.
//
// Primary path: Gemini structured-output classification (geminiService).
// Fallback path: deterministic keyword matching, used automatically when no
// GEMINI_API_KEY is configured, or if the Gemini call errors/times out. This
// keeps the multi-agent demo working offline / without a key.

import { classifyIntent, isGeminiAvailable } from '../services/geminiService.js';

const VALID_INTENTS = new Set([
  'JOIN_CLUB',
  'CAMPUS_UPDATES',
  'EXAM_PREP',
  'PLACEMENT_PREP',
  'HACKATHON_DISCOVERY',
  'NAVIGATION',
  'PROJECT_ASSISTANT',
  'UNKNOWN'
]);

// Fills in the same sensible demo defaults regardless of which path
// (Gemini or rule-based) produced the intent, so downstream agents always
// receive a complete entities object.
function applyEntityDefaults(intent, entities, studentProfile) {
  const filled = { ...entities };

  if (intent === 'JOIN_CLUB' && !filled.clubName) {
    filled.clubName = 'AI Club';
  }
  if (intent === 'EXAM_PREP') {
    filled.subject = filled.subject || 'DBMS';
    filled.timeline = filled.timeline || 'next week';
  }
  if (intent === 'PLACEMENT_PREP') {
    filled.department = filled.department || studentProfile?.department || 'Computer Science';
    filled.year = filled.year || studentProfile?.year || 3;
  }
  if (intent === 'HACKATHON_DISCOVERY' && !filled.subIntent) {
    filled.subIntent = 'GENERAL_DISCOVERY';
  }
  if (intent === 'NAVIGATION') {
    filled.destination = filled.destination || 'Programming Lab';
    filled.source = filled.source || 'Main Gate';
  }
  if (intent === 'PROJECT_ASSISTANT' && !filled.topic) {
    filled.topic = 'AI Project';
  }

  return filled;
}

function detectIntentRuleBased(query) {
  const q = query.toLowerCase().trim();

  let intent = 'UNKNOWN';
  let entities = {};

  if (q.includes('join') || q.includes('register') || q.includes('add me to') || (q.includes('club') && (q.includes('join') || q.includes('register')))) {
    intent = 'JOIN_CLUB';
    if (q.includes('ai')) {
      entities.clubName = 'AI Club';
    } else if (q.includes('coding')) {
      entities.clubName = 'Coding Club';
    } else if (q.includes('web')) {
      entities.clubName = 'WebDev Club';
    }
  }
  else if (q.includes('update') || q.includes('announcement') || q.includes('digest') || q.includes('notice') || q.includes('happen') || q.includes('today')) {
    intent = 'CAMPUS_UPDATES';
  }
  else if (q.includes('exam') || q.includes('dbms') || q.includes('test') || q.includes('study') || q.includes('midterm')) {
    intent = 'EXAM_PREP';
  }
  else if (q.includes('placement') || q.includes('job') || q.includes('career') || q.includes('dsa') || q.includes('roadmap')) {
    intent = 'PLACEMENT_PREP';
  }
  else if (q.includes('hackathon') || q.includes('teammate') || q.includes('team') || q.includes('ideas') || q.includes('participate')) {
    intent = 'HACKATHON_DISCOVERY';
    if (q.includes('teammate') || q.includes('team') || q.includes('partner')) {
      entities.subIntent = 'TEAMMATE_MATCHING';
    } else if (q.includes('idea') || q.includes('project')) {
      entities.subIntent = 'PROJECT_IDEAS';
    }
  }
  else if (q.includes('lab') || q.includes('navigate') || q.includes('route') || q.includes('direction') || q.includes('go to')) {
    intent = 'NAVIGATION';
    if (q.includes('hostel')) {
      entities.source = 'Hostel';
    }
  }
  else if (q.includes('project') || q.includes('build') || q.includes('create')) {
    intent = 'PROJECT_ASSISTANT';
  }

  return { intent, entities, confidence: 0.75 };
}

export async function detectIntent(query, studentProfile) {
  // ── Debug: log the first 8 characters of the configured API key ──────────
  const keyPreview = (process.env.GEMINI_API_KEY || '').slice(0, 8);
  console.log(`[intentAgent] GEMINI_API_KEY prefix: "${keyPreview || '(not set)'}" | isGeminiAvailable: ${isGeminiAvailable()}`);

  let result = null;
  let source = 'rule-based';

  // Only attempt Gemini classification if it is actually configured.
  // This avoids a guaranteed 401/429 when the key is missing/invalid.
  if (isGeminiAvailable()) {
    try {
      const geminiResult = await classifyIntent(query, studentProfile);
      if (geminiResult) {
        result = geminiResult;
        source = 'gemini';
      }
    } catch (err) {
      // Gemini is configured but errored (rate-limit, quota, network, bad key).
      // Fall back gracefully to the deterministic rule-based classifier.
      console.warn(`[intentAgent] Gemini classifyIntent failed (${err.message}). Falling back to rule-based classifier.`);
    }
  } else {
    console.warn('[intentAgent] Gemini not configured — using rule-based classifier.');
  }

  // Fallback to rule-based if Gemini did not produce a result.
  if (!result) {
    result = detectIntentRuleBased(query);
  }

  const entities = applyEntityDefaults(result.intent, result.entities, studentProfile);

  return {
    query,
    intent: VALID_INTENTS.has(result.intent) ? result.intent : 'UNKNOWN',
    entities,
    confidence: result.confidence,
    source,
    timestamp: new Date().toISOString()
  };
}
