import { execFile } from "node:child_process";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import ffprobe from "ffprobe-static";

const run = promisify(execFile);

function ffmpegBinary(): string {
  if (!ffmpegPath) throw new Error("ffmpeg-static did not resolve a binary for this platform");
  return ffmpegPath;
}

export async function probeDurationSec(file: string): Promise<number> {
  const { stdout } = await run(ffprobe.path, [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    file,
  ]);
  const duration = Number.parseFloat(stdout.trim());
  if (!Number.isFinite(duration)) throw new Error(`Could not read duration of ${file}`);
  return duration;
}

export async function writeSilence(file: string, durationSec: number): Promise<void> {
  await run(ffmpegBinary(), [
    "-y",
    "-f",
    "lavfi",
    "-i",
    "anullsrc=channel_layout=mono:sample_rate=44100",
    "-t",
    durationSec.toFixed(3),
    file,
  ]);
}
