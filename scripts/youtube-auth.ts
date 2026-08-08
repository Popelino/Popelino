import http from "node:http";
import { oauthClient, YOUTUBE_SCOPES } from "../src/lib/youtube.ts";

/**
 * One-time OAuth flow: prints the consent URL, catches the callback locally,
 * and prints the refresh token to paste into .env.
 */
const PORT = 871;
const redirectUri = `http://localhost:${PORT}/callback`;
const auth = oauthClient(redirectUri);

const url = auth.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: YOUTUBE_SCOPES,
});

console.log("\nOpen this URL, approve access, and come back:\n");
console.log(url, "\n");
console.log(`Add ${redirectUri} as an authorized redirect URI on the OAuth client first.\n`);

const server = http.createServer(async (request, response) => {
  const code = new URL(request.url ?? "", redirectUri).searchParams.get("code");
  if (!code) {
    response.writeHead(400).end("No code in callback");
    return;
  }

  const { tokens } = await auth.getToken(code);
  response.writeHead(200, { "content-type": "text/plain" }).end("Done — check the terminal.");

  console.log("\nYOUTUBE_REFRESH_TOKEN=" + tokens.refresh_token + "\n");
  server.close();
});

server.listen(PORT);
