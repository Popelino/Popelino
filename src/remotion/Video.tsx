import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { VideoManifest, WordTiming } from "../types.ts";

const FONT_STACK =
  "'Georgia', 'Iowan Old Style', 'Palatino Linotype', 'Times New Roman', serif";

/** Slow push-in so a still image reads as motion. */
const KenBurns: React.FC<{ src: string; durationInFrames: number }> = ({
  src,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationInFrames], [1.06, 1.16], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#0b0b0d" }}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};

const Captions: React.FC<{ words: WordTiming[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  const activeIndex = words.findIndex((word) => time >= word.start && time < word.end);
  if (activeIndex === -1) return null;

  const window = words.slice(Math.max(0, activeIndex - 3), activeIndex + 4);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0.35em",
        maxWidth: "85%",
        fontFamily: FONT_STACK,
        fontSize: 62,
        lineHeight: 1.25,
        textAlign: "center",
        textShadow: "0 4px 24px rgba(0,0,0,0.85)",
      }}
    >
      {window.map((word, i) => (
        <span
          key={`${word.word}-${word.start}-${i}`}
          style={{
            color: word.start === words[activeIndex]?.start ? "#ffd479" : "#f5f2ea",
            opacity: word.start === words[activeIndex]?.start ? 1 : 0.62,
          }}
        >
          {word.word}
        </span>
      ))}
    </div>
  );
};

export const StoryVideo: React.FC<{ manifest: VideoManifest }> = ({ manifest }) => {
  const total = manifest.scenes.reduce((sum, scene) => sum + scene.durationInFrames, 0);
  let offset = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b0d" }}>
      {manifest.scenes.map((scene, index) => {
        const from = offset;
        offset += scene.durationInFrames;
        return (
          <Sequence key={index} from={from} durationInFrames={scene.durationInFrames}>
            <KenBurns
              src={staticFile(scene.imageFile)}
              durationInFrames={scene.durationInFrames}
            />
            <AbsoluteFill
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.7) 100%)",
              }}
            />
            <Audio src={staticFile(scene.audioFile)} />

            {scene.onScreenText ? (
              <AbsoluteFill
                style={{
                  alignItems: "center",
                  justifyContent: "flex-start",
                  paddingTop: 110,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_STACK,
                    fontSize: 54,
                    fontStyle: "italic",
                    color: "#f5f2ea",
                    letterSpacing: "0.01em",
                    textShadow: "0 4px 24px rgba(0,0,0,0.8)",
                  }}
                >
                  {scene.onScreenText}
                </div>
              </AbsoluteFill>
            ) : null}

            <AbsoluteFill
              style={{
                alignItems: "center",
                justifyContent: "flex-end",
                paddingBottom: 220,
              }}
            >
              <Captions words={scene.words} />
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {manifest.musicFile ? (
        <Sequence durationInFrames={total}>
          <Audio src={staticFile(manifest.musicFile)} volume={manifest.musicVolume} loop />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
