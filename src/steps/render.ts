import fs from "node:fs/promises";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { config } from "../config.ts";
import { log } from "../lib/logger.ts";
import type { SceneAssets, Script, VideoManifest } from "../types.ts";

export function buildManifest(
  script: Script,
  scenes: SceneAssets[],
  musicFile: string | null,
): VideoManifest {
  return {
    title: script.title,
    width: config.width,
    height: config.height,
    fps: config.fps,
    musicFile,
    musicVolume: 10 ** (config.music.gainDb / 20),
    scenes: scenes.map((scene) => ({
      imageFile: scene.imageFile,
      audioFile: scene.audioFile,
      // Half a second of air after each line so scenes do not collide.
      durationInFrames: Math.round((scene.durationSec + 0.5) * config.fps),
      onScreenText: script.scenes[scene.index]?.onScreenText ?? "",
      words: scene.words,
    })),
  };
}

export async function render(
  manifest: VideoManifest,
  assetsDir: string,
  outputFile: string,
): Promise<string> {
  await fs.writeFile(
    path.join(assetsDir, "..", "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  log.info("bundling composition");
  const serveUrl = await bundle({
    entryPoint: path.join(config.root, "src", "remotion", "index.ts"),
    publicDir: assetsDir,
  });

  const browserExecutable = config.chromeExecutable;
  const composition = await selectComposition({
    serveUrl,
    id: "story",
    inputProps: { manifest },
    browserExecutable,
  });

  log.info(`rendering ${composition.durationInFrames} frames at ${composition.width}x${composition.height}`);
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: outputFile,
    inputProps: { manifest },
    browserExecutable,
    onProgress: ({ progress }) => {
      if (Math.round(progress * 100) % 20 === 0) {
        process.stdout.write(`\r    ${Math.round(progress * 100)}%   `);
      }
    },
  });
  process.stdout.write("\n");

  return outputFile;
}
