// Post the Meme, Win the Feed — entry program (Node 22, standard library only).
//
// The entry is an X post: a meme picture about make.fun, posted from a public
// account with @_myronera and a make.fun play code in its text. This program
// does one thing: it copies POST.json (the post's address) from the repository
// root to the output directory, where the house reads it and fetches the post's
// public counts through FxTwitter. Nothing this program writes about the post
// is scored — the post itself is the entry.
//
// Local run (mirrors the grader, with /bot and /output swapped for env vars):
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(OUTPUT_DIR, { recursive: true });

const source = join(BOT_DIR, 'POST.json');
const target = join(OUTPUT_DIR, 'POST.json');

try {
  copyFileSync(source, target);
} catch (err) {
  console.error(`Could not copy POST.json from ${source}: ${(err as Error).message}`);
  process.exit(1);
}

// Fail fast on a malformed post file instead of handing the gate garbage:
// POST.json must be {"url": "https://x.com/<handle>/status/<id>"}.
try {
  const posted = JSON.parse(readFileSync(target, 'utf8')) as unknown;
  if (typeof posted !== 'object' || posted === null || typeof (posted as { url?: unknown }).url !== 'string') {
    throw new Error('POST.json has no string "url" field');
  }
} catch (err) {
  console.error(`POST.json is not a valid post address: ${(err as Error).message}`);
  process.exit(1);
}
