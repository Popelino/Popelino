import { parseArgs } from "node:util";
import { log } from "./lib/logger.ts";
import { latestRunId, loadRun } from "./lib/store.ts";
import { runPipeline } from "./pipeline.ts";
import { reviewPerformance } from "./steps/analytics.ts";
import { ideate } from "./steps/ideate.ts";
import { publish } from "./steps/publish.ts";

const USAGE = `youtube-automation

  run [--resume <id>] [--dry-run]   Idea to published video, resumable
  auto                              Review performance, then run the pipeline
  ideate [--count <n>]              Print story ideas without building anything
  publish [--run <id>]              Upload an already-rendered run
  analytics                         What is working on the channel so far
`;

async function main(): Promise<void> {
  const [command = "run", ...rest] = process.argv.slice(2);

  const { values } = parseArgs({
    args: rest,
    options: {
      resume: { type: "string" },
      run: { type: "string" },
      count: { type: "string" },
      "dry-run": { type: "boolean", default: false },
    },
    allowPositionals: false,
  });

  switch (command) {
    case "run": {
      await runPipeline({ runId: values.resume, dryRun: values["dry-run"] });
      break;
    }

    case "auto": {
      // Let last week's numbers inform this week's video.
      try {
        const lessons = await reviewPerformance();
        log.step("lessons");
        for (const line of lessons.whatWorked) log.info(`+ ${line}`);
        for (const line of lessons.whatDidNot) log.info(`- ${line}`);
      } catch (error) {
        log.warn(
          `skipping performance review: ${error instanceof Error ? error.message : error}`,
        );
      }
      await runPipeline();
      break;
    }

    case "ideate": {
      const ideas = await ideate(Number(values.count ?? 5));
      for (const [index, idea] of ideas.entries()) {
        console.log(`\n${index + 1}. ${idea.title}`);
        console.log(`   hook: ${idea.hook}`);
        console.log(`   ${idea.premise}`);
        console.log(`   why: ${idea.whyItLands}`);
      }
      break;
    }

    case "publish": {
      const id = values.run ?? (await latestRunId());
      if (!id) throw new Error("No runs found");
      const run = await loadRun(id);
      if (!run.state.script || !run.state.videoFile) {
        throw new Error(`Run ${id} has no rendered video`);
      }
      await publish(run.state.script, run.state.videoFile);
      break;
    }

    case "analytics": {
      const lessons = await reviewPerformance();
      console.log(JSON.stringify(lessons, null, 2));
      break;
    }

    default:
      console.log(USAGE);
      process.exitCode = 1;
  }
}

main().catch((error) => {
  log.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
