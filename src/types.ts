import { z } from "zod";

export const IdeaSchema = z.object({
  title: z.string(),
  hook: z.string(),
  premise: z.string(),
  whyItLands: z.string(),
  tags: z.array(z.string()),
});
export type Idea = z.infer<typeof IdeaSchema>;

export const IdeaBatchSchema = z.object({ ideas: z.array(IdeaSchema) });

export const SceneSchema = z.object({
  narration: z.string(),
  visualPrompt: z.string(),
  onScreenText: z.string(),
  mood: z.enum(["calm", "tense", "hopeful", "playful", "somber", "triumphant"]),
});
export type Scene = z.infer<typeof SceneSchema>;

export const ScriptSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  visualStyle: z.string(),
  musicMood: z.enum(["calm", "tense", "hopeful", "playful", "somber", "triumphant"]),
  scenes: z.array(SceneSchema),
});
export type Script = z.infer<typeof ScriptSchema>;

export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

export interface SceneAssets {
  index: number;
  audioFile: string;
  imageFile: string;
  durationSec: number;
  words: WordTiming[];
}

/** The single JSON contract between the pipeline and the Remotion composition. */
export interface VideoManifest {
  title: string;
  width: number;
  height: number;
  fps: number;
  musicFile: string | null;
  musicVolume: number;
  scenes: Array<{
    imageFile: string;
    audioFile: string;
    durationInFrames: number;
    onScreenText: string;
    words: WordTiming[];
  }>;
}

export type StepName =
  | "ideate"
  | "script"
  | "voice"
  | "visuals"
  | "music"
  | "render"
  | "publish";

export interface RunState {
  id: string;
  createdAt: string;
  status: "running" | "done" | "failed";
  completedSteps: StepName[];
  idea?: Idea;
  script?: Script;
  scenes?: SceneAssets[];
  musicFile?: string | null;
  videoFile?: string;
  youtubeVideoId?: string;
  error?: string;
}
