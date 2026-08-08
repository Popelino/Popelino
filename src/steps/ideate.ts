import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.ts";
import { channelBrief, generate } from "../lib/claude.ts";
import { log } from "../lib/logger.ts";
import { IdeaBatchSchema, type Idea } from "../types.ts";

/** Tracked in git so the channel's memory survives ephemeral CI runners. */
const HISTORY_FILE = path.join(config.root, "data", "published.json");

interface HistoryEntry {
  title: string;
  premise: string;
  publishedAt: string;
  youtubeVideoId?: string;
}

export async function readHistory(): Promise<HistoryEntry[]> {
  try {
    return JSON.parse(await fs.readFile(HISTORY_FILE, "utf8")) as HistoryEntry[];
  } catch {
    return [];
  }
}

export async function appendHistory(entry: HistoryEntry): Promise<void> {
  const history = await readHistory();
  history.push(entry);
  await fs.mkdir(path.dirname(HISTORY_FILE), { recursive: true });
  await fs.writeFile(HISTORY_FILE, `${JSON.stringify(history, null, 2)}\n`);
}

const SYSTEM = `You develop story ideas for a YouTube channel.

A good idea for this channel:
- opens on a concrete image or a specific claim, not a rhetorical question
- has one clean turn — something the viewer did not see coming
- can be told honestly in the target runtime without cutting corners
- is true, and checkable

Reject ideas that need a "you won't believe" framing to be interesting.`;

export async function ideate(count = 5): Promise<Idea[]> {
  const history = await readHistory();
  const recent = history
    .slice(-40)
    .map((entry) => `- ${entry.title}: ${entry.premise}`)
    .join("\n");

  const { ideas } = await generate({
    system: SYSTEM,
    schema: IdeaBatchSchema,
    effort: "high",
    prompt: [
      channelBrief(),
      "",
      `Propose ${count} distinct story ideas for the next video.`,
      recent
        ? `\nAlready covered — do not repeat these subjects or their close neighbours:\n${recent}`
        : "",
      "",
      "Order them best first. For each, give the title, the opening hook as it would be spoken, the premise in two sentences, why it lands with this audience, and search tags.",
    ].join("\n"),
  });

  log.info(`generated ${ideas.length} ideas`);
  return ideas;
}
