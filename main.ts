// gta6-clipper: entry program for make.fun's "Clip GTA 6 for the most YouTube views".
//
// The clip itself was cut by the agent sessions that built this repository
// (choosing the moment in GTA VI Trailer 2, cropping it vertical, burning in
// the make.fun pitch), and the finished clip was published on YouTube by hand.
// This program does one small, deterministic job: it takes VIDEO.json from
// this repository's root — the file naming that YouTube video — and hands it
// to the harness in /output, so the house can read the video and count its
// views. It uses only the Node standard library and touches no network.
//
// Run it from the repository root: node main.ts
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// The repository root is the folder this file lives in.
const repoRoot = dirname(fileURLToPath(import.meta.url));
const videoFile = join(repoRoot, "VIDEO.json");
const outDir = "/output";
const outFile = join(outDir, "VIDEO.json");

function fail(message: string): never {
  console.error(`gta6-clipper: ${message}`);
  process.exit(1);
}

if (!existsSync(videoFile)) {
  fail(
    "VIDEO.json is missing from the repository root. " +
      "Publish the clip on YouTube first, then write VIDEO.json " +
      'as {"url": "<the video share URL>"} and run this again.',
  );
}

const raw = readFileSync(videoFile, "utf8");
let video: unknown;
try {
  video = JSON.parse(raw);
} catch {
  fail("VIDEO.json is not valid JSON.");
}

if (typeof video !== "object" || video === null || Array.isArray(video)) {
  fail('VIDEO.json must be an object like {"url": "<YouTube URL>"}.');
}

const url = (video as { url?: unknown }).url;
if (typeof url !== "string" || url.length === 0) {
  fail('VIDEO.json must carry a "url" string naming the YouTube video.');
}

// The share URL YouTube gives for a Short or a video: youtube.com/shorts/<id>,
// youtube.com/watch?v=<id>, or youtu.be/<id>. The id is 11 characters.
const youtube = /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
const match = youtube.exec(url.trim());
if (match === null) {
  fail(`VIDEO.json "url" does not look like a YouTube video address: ${url}`);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(videoFile, outFile);
console.log(`gta6-clipper: VIDEO.json copied to ${outFile}`);
console.log(`gta6-clipper: video id ${match[1]}`);
