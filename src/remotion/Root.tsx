import React from "react";
import { Composition } from "remotion";
import type { VideoManifest } from "../types.ts";
import { StoryVideo } from "./Video.tsx";

const EMPTY: VideoManifest = {
  title: "Preview",
  width: 1080,
  height: 1920,
  fps: 30,
  musicFile: null,
  musicVolume: 0.1,
  scenes: [],
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="story"
    component={StoryVideo}
    defaultProps={{ manifest: EMPTY }}
    fps={30}
    width={1080}
    height={1920}
    durationInFrames={1}
    calculateMetadata={({ props }) => {
      const { manifest } = props;
      const frames = manifest.scenes.reduce(
        (sum, scene) => sum + scene.durationInFrames,
        0,
      );
      return {
        fps: manifest.fps,
        width: manifest.width,
        height: manifest.height,
        durationInFrames: Math.max(1, frames),
      };
    }}
  />
);
