import { NextRequest, NextResponse } from "next/server";
import { callClaude, parseJsonLoose, visionMessage, MODELS } from "@/lib/openrouter";

export const runtime = "nodejs";

// POST { frames: string[] (2-3 base64 data URLs), club?: string, context?: string }
// → { observation, drillRecommendation, bagSlotAffected, confidence }
export async function POST(req: NextRequest) {
  try {
    const { frames, club, context } = await req.json();
    if (!Array.isArray(frames) || frames.length === 0) {
      return NextResponse.json({ error: "Missing 'frames' (array of base64 data URLs)" }, { status: 400 });
    }
    const images = (frames as string[])
      .slice(0, 3)
      .map((f) => (f.startsWith("data:") ? f : `data:image/jpeg;base64,${f}`));

    const prompt = `You are a PGA-level golf coach analyzing swing frames${
      club ? ` for a ${club}` : ""
    }. ${context ? `Context from the player: ${context}. ` : ""}
These frames are sequential moments from one swing (e.g. address, top, impact).
Identify the single most impactful fault or strength, then prescribe ONE drill.
Return ONLY valid JSON:
{
  "observation": string,            // plain-English, specific, 1-2 sentences
  "drillRecommendation": string,    // name + one-line how-to
  "bagSlotAffected": "driver"|"woods"|"hybrid"|"midiron"|"shortiron"|"wedge"|"approach"|"chip"|"bunker"|"putting"|"mgmt"|"zones"|"pressure"|"consist",
  "confidence": "low"|"medium"|"high"
}`;

    const raw = await callClaude([visionMessage(prompt, images)], {
      model: MODELS.vision,
      json: true,
      maxTokens: 700,
      temperature: 0.3,
    });

    const parsed = parseJsonLoose(raw);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
