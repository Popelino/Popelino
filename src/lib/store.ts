import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.ts";
import type { RunState, StepName } from "../types.ts";

export interface Run {
  id: string;
  dir: string;
  assetsDir: string;
  state: RunState;
}

function runDir(id: string): string {
  return path.join(config.runsDir, id);
}

function newRunId(): string {
  const now = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `${now}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function createRun(): Promise<Run> {
  const id = newRunId();
  const dir = runDir(id);
  const assetsDir = path.join(dir, "assets");
  await fs.mkdir(assetsDir, { recursive: true });
  const run: Run = {
    id,
    dir,
    assetsDir,
    state: {
      id,
      createdAt: new Date().toISOString(),
      status: "running",
      completedSteps: [],
    },
  };
  await save(run);
  return run;
}

export async function loadRun(id: string): Promise<Run> {
  const dir = runDir(id);
  const state = JSON.parse(
    await fs.readFile(path.join(dir, "run.json"), "utf8"),
  ) as RunState;
  return { id, dir, assetsDir: path.join(dir, "assets"), state };
}

export async function latestRunId(): Promise<string | null> {
  const entries = await fs.readdir(config.runsDir).catch(() => [] as string[]);
  return entries.sort().at(-1) ?? null;
}

export async function save(run: Run): Promise<void> {
  await fs.writeFile(
    path.join(run.dir, "run.json"),
    `${JSON.stringify(run.state, null, 2)}\n`,
  );
}

export async function markDone(run: Run, step: StepName): Promise<void> {
  if (!run.state.completedSteps.includes(step)) {
    run.state.completedSteps.push(step);
  }
  await save(run);
}

export function isDone(run: Run, step: StepName): boolean {
  return run.state.completedSteps.includes(step);
}
