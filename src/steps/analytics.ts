import { google } from "googleapis";
import { z } from "zod";
import { channelBrief, generate } from "../lib/claude.ts";
import { log } from "../lib/logger.ts";
import { authorizedClient } from "../lib/youtube.ts";
import { readHistory } from "./ideate.ts";

const LessonsSchema = z.object({
  whatWorked: z.array(z.string()),
  whatDidNot: z.array(z.string()),
  nextIdeas: z.array(z.string()),
});

interface VideoStats {
  title: string;
  views: number;
  averageViewPercentage: number;
  likes: number;
}

async function fetchStats(videoIds: string[]): Promise<VideoStats[]> {
  if (videoIds.length === 0) return [];

  const auth = authorizedClient();
  const youtube = google.youtube({ version: "v3", auth });
  const analytics = google.youtubeAnalytics({ version: "v2", auth });

  const details = await youtube.videos.list({
    part: ["snippet", "statistics"],
    id: videoIds,
  });

  const report = await analytics.reports.query({
    ids: "channel==MINE",
    startDate: "2000-01-01",
    endDate: new Date().toISOString().slice(0, 10),
    metrics: "views,averageViewPercentage",
    dimensions: "video",
    filters: `video==${videoIds.join(",")}`,
  });

  const rows = new Map<string, { views: number; retention: number }>();
  for (const row of report.data.rows ?? []) {
    const [id, views, retention] = row as [string, number, number];
    rows.set(id, { views, retention });
  }

  return (details.data.items ?? []).map((item) => {
    const measured = rows.get(item.id ?? "");
    return {
      title: item.snippet?.title ?? "(untitled)",
      views: measured?.views ?? Number(item.statistics?.viewCount ?? 0),
      averageViewPercentage: measured?.retention ?? 0,
      likes: Number(item.statistics?.likeCount ?? 0),
    };
  });
}

/**
 * Reads back how published videos actually performed and turns it into
 * guidance the next ideation pass can use.
 */
export async function reviewPerformance(): Promise<z.infer<typeof LessonsSchema>> {
  const history = await readHistory();
  const videoIds = history
    .map((entry) => entry.youtubeVideoId)
    .filter((id): id is string => Boolean(id))
    .slice(-25);

  const stats = await fetchStats(videoIds);
  log.info(`reviewing ${stats.length} published videos`);

  const table = stats
    .map(
      (video) =>
        `- "${video.title}" — ${video.views} views, ${video.averageViewPercentage.toFixed(0)}% average view, ${video.likes} likes`,
    )
    .join("\n");

  return generate({
    system:
      "You analyse YouTube performance data for a small channel. Be concrete and honest. Say 'not enough data' rather than inventing a pattern from three videos.",
    schema: LessonsSchema,
    effort: "high",
    prompt: [
      channelBrief(),
      "",
      "Performance so far:",
      table || "(no published videos yet)",
      "",
      "What is working, what is not, and what should the next few videos be? Tie every claim to a number above.",
    ].join("\n"),
  });
}
