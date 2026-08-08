import { config } from "../config.ts";
import { channelBrief, generate } from "../lib/claude.ts";
import { log } from "../lib/logger.ts";
import { ScriptSchema, type Idea, type Script } from "../types.ts";

const SYSTEM = `You write narration for short animated videos and break it into scenes.

Rules that matter:
- Narration is spoken aloud. Write for the ear: short sentences, no parentheses, no bullet points, no numerals that are ambiguous when read.
- One idea per scene. A scene is 3 to 8 seconds of speech.
- Every scene's visual prompt describes a single still image that a text-to-image model can render: subject, setting, composition, lighting, medium. No text in the image, no words, no logos, no watermarks.
- On-screen text is at most four words and reinforces the narration rather than repeating it.
- The last scene lands the point. Do not end on a call to subscribe.`;

export async function writeScript(idea: Idea): Promise<Script> {
  const sceneCount = Math.max(4, Math.round(config.targetDurationSec / 6));

  const script = await generate({
    system: SYSTEM,
    schema: ScriptSchema,
    effort: "high",
    prompt: [
      channelBrief(),
      "",
      "Story to tell:",
      `Title: ${idea.title}`,
      `Hook: ${idea.hook}`,
      `Premise: ${idea.premise}`,
      "",
      `Write roughly ${sceneCount} scenes totalling about ${config.targetDurationSec} seconds of narration.`,
      "Pick one visual style and state it once — every scene's visual prompt must be consistent with it so the video looks like a single piece.",
      "Also write the YouTube title (under 70 characters), the description (2 short paragraphs, no hashtag spam), and up to 12 tags.",
    ].join("\n"),
  });

  const words = script.scenes.reduce(
    (total, scene) => total + scene.narration.split(/\s+/).length,
    0,
  );
  log.info(`${script.scenes.length} scenes, ~${Math.round((words / 150) * 60)}s of narration`);
  return script;
}
