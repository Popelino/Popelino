import fs from "node:fs/promises";
import { config, requireEnv } from "../config.ts";
import { probeDurationSec, writeSilence } from "../lib/media.ts";
import type { WordTiming } from "../types.ts";

export interface Narration {
  durationSec: number;
  words: WordTiming[];
}

interface ElevenLabsAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

/** Collapse per-character alignment into word-level timings for captions. */
function toWordTimings(alignment: ElevenLabsAlignment): WordTiming[] {
  const words: WordTiming[] = [];
  let current = "";
  let start = 0;

  const flush = (end: number) => {
    if (current.trim()) words.push({ word: current.trim(), start, end });
    current = "";
  };

  alignment.characters.forEach((character, i) => {
    const charStart = alignment.character_start_times_seconds[i] ?? 0;
    const charEnd = alignment.character_end_times_seconds[i] ?? charStart;
    if (/\s/.test(character)) {
      flush(charEnd);
    } else {
      if (!current) start = charStart;
      current += character;
    }
  });
  flush(alignment.character_end_times_seconds.at(-1) ?? start);

  return words;
}

/** Rough word timings for providers that do not return alignment data. */
function estimateWordTimings(text: string, durationSec: number): WordTiming[] {
  const tokens = text.split(/\s+/).filter(Boolean);
  const per = tokens.length > 0 ? durationSec / tokens.length : 0;
  return tokens.map((word, i) => ({
    word,
    start: i * per,
    end: (i + 1) * per,
  }));
}

async function elevenLabs(text: string, outputFile: string): Promise<Narration> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${config.tts.voiceId}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": requireEnv("ELEVENLABS_API_KEY"),
        "content-type": "application/json",
      },
      body: JSON.stringify({ text, model_id: config.tts.modelId }),
    },
  );
  if (!response.ok) {
    throw new Error(`ElevenLabs ${response.status}: ${await response.text()}`);
  }

  const payload = (await response.json()) as {
    audio_base64: string;
    alignment: ElevenLabsAlignment | null;
  };
  await fs.writeFile(outputFile, Buffer.from(payload.audio_base64, "base64"));

  const durationSec = await probeDurationSec(outputFile);
  return {
    durationSec,
    words: payload.alignment
      ? toWordTimings(payload.alignment)
      : estimateWordTimings(text, durationSec),
  };
}

/** Silent track sized to a natural reading pace — lets the pipeline run without keys. */
async function silent(text: string, outputFile: string): Promise<Narration> {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const durationSec = Math.max(2, (wordCount / 150) * 60);
  await writeSilence(outputFile, durationSec);
  return { durationSec, words: estimateWordTimings(text, durationSec) };
}

export async function synthesize(text: string, outputFile: string): Promise<Narration> {
  switch (config.tts.provider) {
    case "elevenlabs":
      return elevenLabs(text, outputFile);
    case "silent":
      return silent(text, outputFile);
    default:
      throw new Error(`Unknown TTS_PROVIDER "${config.tts.provider}"`);
  }
}
