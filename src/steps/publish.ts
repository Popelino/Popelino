import { createReadStream } from "node:fs";
import { google } from "googleapis";
import { config } from "../config.ts";
import { log } from "../lib/logger.ts";
import { authorizedClient } from "../lib/youtube.ts";
import type { Script } from "../types.ts";

export async function publish(script: Script, videoFile: string): Promise<string> {
  const youtube = google.youtube({ version: "v3", auth: authorizedClient() });

  const description = [
    script.description,
    "",
    script.tags.map((tag) => `#${tag.replace(/\s+/g, "")}`).join(" "),
  ].join("\n");

  log.info(`uploading as ${config.youtube.privacyStatus}`);
  const response = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: script.title.slice(0, 100),
        description: description.slice(0, 5000),
        tags: script.tags.slice(0, 15),
        categoryId: config.youtube.categoryId,
      },
      status: {
        privacyStatus: config.youtube.privacyStatus,
        selfDeclaredMadeForKids: false,
      },
    },
    media: { body: createReadStream(videoFile) },
  });

  const videoId = response.data.id;
  if (!videoId) throw new Error("YouTube accepted the upload but returned no video ID");

  log.info(`https://youtu.be/${videoId}`);
  return videoId;
}
