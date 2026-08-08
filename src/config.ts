import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function env(key: string, fallback: string): string {
  const value = process.env[key];
  return value === undefined || value === "" ? fallback : value;
}

export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable ${key}`);
  return value;
}

const format = env("VIDEO_FORMAT", "short") === "long" ? "long" : "short";

export const config = {
  root,
  runsDir: path.join(root, "runs"),
  musicDir: path.resolve(root, env("MUSIC_DIR", "assets/music")),

  model: env("CLAUDE_MODEL", "claude-opus-5"),

  /** Point Remotion at an existing browser instead of letting it download one. */
  chromeExecutable: process.env.CHROME_EXECUTABLE || null,

  channel: {
    name: env("CHANNEL_NAME", "Untitled Channel"),
    topic: env("CHANNEL_TOPIC", "Short, surprising true stories"),
    audience: env("CHANNEL_AUDIENCE", "Curious adults watching on a phone"),
    tone: env("CHANNEL_TONE", "Warm, precise, no hype"),
  },

  format,
  width: format === "long" ? 1920 : 1080,
  height: format === "long" ? 1080 : 1920,
  fps: 30,
  targetDurationSec: Number(env("TARGET_DURATION_SEC", "60")),

  tts: {
    provider: env("TTS_PROVIDER", "silent"),
    voiceId: env("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM"),
    modelId: env("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2"),
  },

  images: {
    provider: env("IMAGE_PROVIDER", "placeholder"),
    falModel: env("FAL_MODEL", "fal-ai/flux/schnell"),
  },

  music: {
    gainDb: Number(env("MUSIC_GAIN_DB", "-22")),
  },

  youtube: {
    privacyStatus: env("YOUTUBE_PRIVACY_STATUS", "private"),
    categoryId: env("YOUTUBE_CATEGORY_ID", "27"),
  },
} as const;

export type Config = typeof config;
