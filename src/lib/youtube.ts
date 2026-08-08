import { google } from "googleapis";
import { requireEnv } from "../config.ts";

export const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
];

export function oauthClient(redirectUri = "http://localhost:871/callback") {
  return new google.auth.OAuth2(
    requireEnv("YOUTUBE_CLIENT_ID"),
    requireEnv("YOUTUBE_CLIENT_SECRET"),
    redirectUri,
  );
}

export function authorizedClient() {
  const auth = oauthClient();
  auth.setCredentials({ refresh_token: requireEnv("YOUTUBE_REFRESH_TOKEN") });
  return auth;
}
