/**
 * Gemini API Client — Wrapper for Google Generative AI SDK
 * Uses Gemini 2.5 Pro for complex reasoning and 2.5 Flash for fast tasks.
 */

import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not set. Get one at https://aistudio.google.com/apikey");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export function getGeminiPro(): GenerativeModel {
  return getGenAI().getGenerativeModel({
    model: "gemini-2.5-pro-preview-05-06",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  });
}

export function getGeminiFlash(): GenerativeModel {
  return getGenAI().getGenerativeModel({
    model: "gemini-2.5-flash-preview-04-17",
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    },
  });
}

export function getGeminiFlashText(): GenerativeModel {
  return getGenAI().getGenerativeModel({
    model: "gemini-2.5-flash-preview-04-17",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });
}

// ─── Concurrency Limiter ─────────────────────────────────
// PERF FIX: Prevents memory/network exhaustion when ATLAS pipeline
// fires 15+ agents in parallel across layers. Max 3 concurrent calls.
const MAX_CONCURRENT_CALLS = 3;
let activeCalls = 0;
const callQueue: (() => void)[] = [];

function acquireSlot(): Promise<void> {
  if (activeCalls < MAX_CONCURRENT_CALLS) {
    activeCalls++;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    callQueue.push(() => {
      activeCalls++;
      resolve();
    });
  });
}

function releaseSlot(): void {
  activeCalls--;
  if (callQueue.length > 0) {
    const next = callQueue.shift()!;
    next();
  }
}

/**
 * Safe wrapper to call Gemini and parse JSON response.
 * Returns null on any failure — callers should have fallback logic.
 * Uses a semaphore to limit concurrent calls to MAX_CONCURRENT_CALLS.
 */
export async function callGemini<T>(
  model: GenerativeModel,
  prompt: string,
  agentName: string
): Promise<{ data: T | null; tokensUsed: number; durationMs: number }> {
  const start = Date.now();
  await acquireSlot();
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const durationMs = Date.now() - start;
    const tokensUsed = response.usageMetadata?.totalTokenCount || 0;

    // Try to parse JSON
    try {
      // Strip markdown code fences if present
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const data = JSON.parse(cleaned) as T;
      console.log(`[${agentName}] ✅ ${durationMs}ms, ${tokensUsed} tokens`);
      return { data, tokensUsed, durationMs };
    } catch {
      console.warn(`[${agentName}] ⚠️ JSON parse failed, returning raw text`);
      return { data: text as unknown as T, tokensUsed, durationMs };
    }
  } catch (error) {
    const durationMs = Date.now() - start;
    console.error(`[${agentName}] ❌ Error after ${durationMs}ms:`, error);
    return { data: null, tokensUsed: 0, durationMs };
  } finally {
    releaseSlot();
  }
}

export function isGeminiConfigured(): boolean {
  return !!process.env.GOOGLE_API_KEY;
}
