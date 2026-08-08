# youtube-animation-automation

An autonomous pipeline that takes a channel brief and produces a finished YouTube
video: it invents the story, writes the narration, illustrates every scene,
narrates it, animates it, mixes music, uploads it, and reads the numbers back to
inform the next one.

```
ideate → script → voice → visuals → music → render → publish → analytics
   ↑                                                              │
   └──────────────── what actually got watched ───────────────────┘
```

Each stage writes its result into `runs/<id>/run.json`, so a run that dies at the
render stage resumes from the render stage — it does not pay for the voice and
images again.

## What each stage does

| Stage | What happens | Swappable |
|---|---|---|
| **ideate** | Claude proposes story ideas grounded in the channel brief, and is shown everything already published so it does not repeat itself. | model, prompt |
| **script** | Claude turns the chosen idea into scenes: spoken narration, a still-image prompt, on-screen text, and a mood — plus the YouTube title, description and tags. | model, prompt |
| **voice** | Each scene's narration becomes an audio file with **word-level timings**, which is what makes the karaoke captions land on the beat. | ElevenLabs / silent |
| **visuals** | One image per scene, all sharing a single visual style so the video reads as one piece. | fal / OpenAI / placeholder |
| **music** | Picks a bed from your local library matching the script's mood. | local library |
| **render** | Remotion composes stills, Ken Burns motion, captions, narration and music into an MP4. | — |
| **publish** | Uploads via the YouTube Data API with title, description and tags. | — |
| **analytics** | Pulls views and average-view-percentage back from YouTube Analytics and asks Claude what to make next. | — |

Every provider is behind a small interface. `TTS_PROVIDER=silent` and
`IMAGE_PROVIDER=placeholder` let you run the whole pipeline end to end and get a
real MP4 before you have signed up for anything.

## Setup

```bash
npm install
cp .env.example .env      # fill in at minimum ANTHROPIC_API_KEY and the channel brief
```

The channel brief in `.env` is the most important configuration in the project —
`CHANNEL_TOPIC`, `CHANNEL_AUDIENCE` and `CHANNEL_TONE` are fed into every
generation step. Vague brief, generic videos.

For uploads, create an OAuth client (type *Desktop app*) in a Google Cloud project
with the YouTube Data API v3 and YouTube Analytics API enabled, then:

```bash
npm run auth:youtube      # prints the consent URL, catches the callback, prints the refresh token
```

## Usage

```bash
npm run run -- --dry-run        # full pipeline, stops before uploading
npm run run                     # idea to published video
npm run run -- --resume <id>    # continue a run that failed partway
npm run ideate -- --count 8     # just look at story ideas
npm run analytics               # what is working on the channel so far
npm run auto                    # review performance, then produce the next video
npm run studio                  # open the Remotion editor on the last manifest
```

Rendered videos land in `runs/<id>/video.mp4`, next to the manifest and every
intermediate asset.

Remotion downloads its own headless Chromium on first render. If your network
blocks that, point `CHROME_EXECUTABLE` at an existing **headless-shell** build
(a full Chrome binary will not launch — old headless mode was removed from it).

## Running itself

`.github/workflows/youtube-automation.yml` runs `npm run auto` on a schedule
(Tuesdays and Fridays by default). It reviews how the last videos performed,
produces the next one, uploads it, and commits the updated `data/published.json`
so the channel's memory survives the ephemeral runner.

Configure it with repository **secrets** (`ANTHROPIC_API_KEY`,
`ELEVENLABS_API_KEY`, `FAL_API_KEY`, `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`,
`YOUTUBE_REFRESH_TOKEN`) and repository **variables** for the channel brief
(`CHANNEL_TOPIC`, `CHANNEL_AUDIENCE`, `CHANNEL_TONE`, `VIDEO_FORMAT`, …).

Leave `YOUTUBE_PRIVACY_STATUS=private` until you have watched several outputs
end to end. Unattended publishing to a public channel is a decision to make
deliberately, not a default to inherit.

## Layout

```
src/
  cli.ts            command surface
  pipeline.ts       the resumable orchestrator
  config.ts         channel brief + provider selection from .env
  steps/            ideate, script, assets, render, publish, analytics
  providers/        tts.ts, images.ts — the swappable bits
  remotion/         the animated composition
  lib/              Claude client, run store, ffmpeg, YouTube auth
data/published.json what has already been made, so ideas stay fresh
assets/music/       your royalty-free loops, named by mood
runs/               one directory per run (gitignored)
```

## Costs and limits

A 60-second video is roughly one Claude call for ideas, one for the script,
~10 TTS requests and ~10 image generations. The YouTube Data API charges 1600
quota units per upload against a 10,000/day default, so roughly six uploads a
day before you need a quota increase.
