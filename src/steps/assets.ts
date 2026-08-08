import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.ts";
import { log } from "../lib/logger.ts";
import { generateImage } from "../providers/images.ts";
import { synthesize } from "../providers/tts.ts";
import type { SceneAssets, Script } from "../types.ts";

/** Narrate every scene. Sequential: TTS providers rate-limit hard on bursts. */
export async function narrate(script: Script, assetsDir: string): Promise<SceneAssets[]> {
  const scenes: SceneAssets[] = [];

  for (const [index, scene] of script.scenes.entries()) {
    const file = path.join(assetsDir, `voice-${index}.mp3`);
    const narration = await synthesize(scene.narration, file);
    log.info(`scene ${index + 1}/${script.scenes.length} voiced (${narration.durationSec.toFixed(1)}s)`);
    scenes.push({
      index,
      audioFile: path.basename(file),
      imageFile: "",
      durationSec: narration.durationSec,
      words: narration.words,
    });
  }

  return scenes;
}

export async function illustrate(
  script: Script,
  scenes: SceneAssets[],
  assetsDir: string,
): Promise<SceneAssets[]> {
  const results: SceneAssets[] = [];

  for (const scene of scenes) {
    const source = script.scenes[scene.index];
    if (!source) throw new Error(`No script scene at index ${scene.index}`);

    const prompt = `${source.visualPrompt}. Visual style: ${script.visualStyle}. No text, no lettering, no watermark.`;
    const file = await generateImage(prompt, path.join(assetsDir, `image-${scene.index}`));
    log.info(`scene ${scene.index + 1}/${scenes.length} illustrated`);
    results.push({ ...scene, imageFile: path.basename(file) });
  }

  return results;
}

/**
 * Pick a music bed for the script's mood from the local library, falling back to
 * any available track. Returns null when the library is empty — the video then
 * renders without music rather than failing.
 */
export async function pickMusic(script: Script, assetsDir: string): Promise<string | null> {
  const available = await fs
    .readdir(config.musicDir)
    .catch(() => [] as string[])
    .then((files) => files.filter((file) => /\.(mp3|m4a|wav|ogg)$/i.test(file)));

  if (available.length === 0) {
    log.warn(`no tracks in ${config.musicDir} — rendering without music`);
    return null;
  }

  const chosen =
    available.find((file) => file.toLowerCase().startsWith(script.musicMood)) ?? available[0]!;
  await fs.copyFile(path.join(config.musicDir, chosen), path.join(assetsDir, chosen));
  log.info(`music: ${chosen}`);
  return chosen;
}
