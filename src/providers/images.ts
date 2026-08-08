import fs from "node:fs/promises";
import { config, requireEnv } from "../config.ts";

async function download(url: string, outputFile: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image download ${response.status} for ${url}`);
  await fs.writeFile(outputFile, Buffer.from(await response.arrayBuffer()));
}

async function fal(prompt: string, outputFile: string): Promise<void> {
  const response = await fetch(`https://fal.run/${config.images.falModel}`, {
    method: "POST",
    headers: {
      authorization: `Key ${requireEnv("FAL_API_KEY")}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      image_size: config.format === "short" ? "portrait_16_9" : "landscape_16_9",
      num_images: 1,
    }),
  });
  if (!response.ok) throw new Error(`fal ${response.status}: ${await response.text()}`);

  const payload = (await response.json()) as { images?: Array<{ url: string }> };
  const url = payload.images?.[0]?.url;
  if (!url) throw new Error("fal returned no image");
  await download(url, outputFile);
}

async function openai(prompt: string, outputFile: string): Promise<void> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      authorization: `Bearer ${requireEnv("OPENAI_API_KEY")}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: config.format === "short" ? "1024x1536" : "1536x1024",
      n: 1,
    }),
  });
  if (!response.ok) throw new Error(`OpenAI images ${response.status}: ${await response.text()}`);

  const payload = (await response.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>;
  };
  const image = payload.data?.[0];
  if (image?.b64_json) {
    await fs.writeFile(outputFile, Buffer.from(image.b64_json, "base64"));
  } else if (image?.url) {
    await download(image.url, outputFile);
  } else {
    throw new Error("OpenAI returned no image");
  }
}

/** Deterministic gradient card — keeps renders working before an image key exists. */
async function placeholder(prompt: string, outputFile: string): Promise<void> {
  let hash = 0;
  for (const character of prompt) hash = (hash * 31 + character.charCodeAt(0)) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${config.width}" height="${config.height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hash} 55% 28%)"/>
      <stop offset="100%" stop-color="hsl(${(hash + 48) % 360} 60% 12%)"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
</svg>`;
  await fs.writeFile(outputFile, svg);
}

/** Returns the file extension actually written (svg for placeholders, jpg otherwise). */
export async function generateImage(prompt: string, outputBase: string): Promise<string> {
  if (config.images.provider === "placeholder") {
    const file = `${outputBase}.svg`;
    await placeholder(prompt, file);
    return file;
  }

  const file = `${outputBase}.jpg`;
  switch (config.images.provider) {
    case "fal":
      await fal(prompt, file);
      return file;
    case "openai":
      await openai(prompt, file);
      return file;
    default:
      throw new Error(`Unknown IMAGE_PROVIDER "${config.images.provider}"`);
  }
}
