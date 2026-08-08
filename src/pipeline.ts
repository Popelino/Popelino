import path from "node:path";
import { log } from "./lib/logger.ts";
import {
  createRun,
  isDone,
  loadRun,
  markDone,
  save,
  type Run,
} from "./lib/store.ts";
import { illustrate, narrate, pickMusic } from "./steps/assets.ts";
import { appendHistory, ideate } from "./steps/ideate.ts";
import { publish } from "./steps/publish.ts";
import { buildManifest, render } from "./steps/render.ts";
import { writeScript } from "./steps/script.ts";

export interface PipelineOptions {
  /** Resume an existing run instead of starting a new one. */
  runId?: string;
  /** Stop before uploading. */
  dryRun?: boolean;
}

/**
 * Idea → script → voice → visuals → music → render → publish.
 * Every step records itself in run.json, so a failed run resumes where it stopped.
 */
export async function runPipeline(options: PipelineOptions = {}): Promise<Run> {
  const run = options.runId ? await loadRun(options.runId) : await createRun();
  log.step("run", run.id);

  try {
    if (!isDone(run, "ideate")) {
      log.step("ideate");
      const ideas = await ideate(5);
      const best = ideas[0];
      if (!best) throw new Error("Ideation returned no ideas");
      run.state.idea = best;
      await markDone(run, "ideate");
      log.info(`chose "${best.title}"`);
    }

    if (!isDone(run, "script")) {
      log.step("script");
      run.state.script = await writeScript(run.state.idea!);
      await markDone(run, "script");
    }

    if (!isDone(run, "voice")) {
      log.step("voice");
      run.state.scenes = await narrate(run.state.script!, run.assetsDir);
      await markDone(run, "voice");
    }

    if (!isDone(run, "visuals")) {
      log.step("visuals");
      run.state.scenes = await illustrate(
        run.state.script!,
        run.state.scenes!,
        run.assetsDir,
      );
      await markDone(run, "visuals");
    }

    if (!isDone(run, "music")) {
      log.step("music");
      run.state.musicFile = await pickMusic(run.state.script!, run.assetsDir);
      await markDone(run, "music");
    }

    if (!isDone(run, "render")) {
      log.step("render");
      const manifest = buildManifest(
        run.state.script!,
        run.state.scenes!,
        run.state.musicFile ?? null,
      );
      const outputFile = path.join(run.dir, "video.mp4");
      run.state.videoFile = await render(manifest, run.assetsDir, outputFile);
      await markDone(run, "render");
    }

    if (options.dryRun) {
      log.step("done", `dry run — video at ${run.state.videoFile}`);
      run.state.status = "done";
      await save(run);
      return run;
    }

    if (!isDone(run, "publish")) {
      log.step("publish");
      run.state.youtubeVideoId = await publish(run.state.script!, run.state.videoFile!);
      await markDone(run, "publish");
      await appendHistory({
        title: run.state.script!.title,
        premise: run.state.idea!.premise,
        publishedAt: new Date().toISOString(),
        youtubeVideoId: run.state.youtubeVideoId,
      });
    }

    run.state.status = "done";
    await save(run);
    log.step("done", `https://youtu.be/${run.state.youtubeVideoId}`);
    return run;
  } catch (error) {
    run.state.status = "failed";
    run.state.error = error instanceof Error ? error.message : String(error);
    await save(run);
    throw error;
  }
}
