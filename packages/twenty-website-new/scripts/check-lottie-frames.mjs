#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const LOTTIE_PATH = path.join(
  ROOT,
  'public',
  'lottie',
  'stepper',
  'stepper.lottie',
);
const ANIMATION_ENTRY = 'animations/main.json';
const FRAME_MAP_PATH = path.join(
  ROOT,
  'src',
  'sections',
  'HomeStepper',
  'components',
  'Visual',
  'use-dot-lottie-scroll-sync.ts',
);

const EXPECTED_CONSTANT_REGEX =
  /(?:export\s+)?const\s+HOME_STEPPER_LOTTIE_EXPECTED_TOTAL_FRAMES\s*=\s*(\d+)\s*;/;

function fail(message) {
  // eslint-disable-next-line no-console
  console.error(`\n  check-lottie-frames: ${message}\n`);
  process.exitCode = 1;
}

async function readExpectedTotalFrames() {
  const source = await readFile(FRAME_MAP_PATH, 'utf8');
  const match = source.match(EXPECTED_CONSTANT_REGEX);
  if (match === null) {
    throw new Error(
      `couldn't find HOME_STEPPER_LOTTIE_EXPECTED_TOTAL_FRAMES in ${path.relative(ROOT, FRAME_MAP_PATH)}. ` +
        'Has the constant been renamed? Update both the TS file and the regex in this script.',
    );
  }
  return Number.parseInt(match[1], 10);
}

async function readActualTotalFrames() {
  let stdout;
  try {
    const result = await execFileAsync(
      'unzip',
      ['-p', LOTTIE_PATH, ANIMATION_ENTRY],
      { maxBuffer: 32 * 1024 * 1024, encoding: 'buffer' },
    );
    stdout = result.stdout;
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(
        '`unzip` binary not found on PATH. Install it (Debian/Ubuntu: `apt install unzip`, macOS ships with it) — ' +
          'this script needs it to read the Lottie animation JSON.',
      );
    }
    throw new Error(
      `failed to extract ${ANIMATION_ENTRY} from ${path.relative(ROOT, LOTTIE_PATH)}: ${error?.message ?? error}`,
    );
  }

  let animation;
  try {
    animation = JSON.parse(stdout.toString('utf8'));
  } catch (error) {
    throw new Error(
      `${ANIMATION_ENTRY} inside the .lottie file is not valid JSON: ${error?.message ?? error}`,
    );
  }

  const ip = animation?.ip;
  const op = animation?.op;
  if (typeof ip !== 'number' || typeof op !== 'number') {
    throw new Error(
      `${ANIMATION_ENTRY} is missing numeric \`ip\` / \`op\` fields ` +
        `(got ip=${JSON.stringify(ip)}, op=${JSON.stringify(op)}). ` +
        'Has the Lottie schema changed?',
    );
  }
  return Math.floor(op - ip);
}

async function main() {
  const [expected, actual] = await Promise.all([
    readExpectedTotalFrames(),
    readActualTotalFrames(),
  ]);

  if (expected !== actual) {
    fail(
      `Lottie totalFrames mismatch — expected ${expected} (per HOME_STEPPER_LOTTIE_EXPECTED_TOTAL_FRAMES), ` +
        `got ${actual} from ${path.relative(ROOT, LOTTIE_PATH)}.\n  ` +
        '  The home-stepper scroll → frame map is keyed to the authored timeline; ' +
        'either:\n    1. revert the Lottie re-export, or\n    2. update HOME_STEPPER_LOTTIE_EXPECTED_TOTAL_FRAMES ' +
        'and the STEP_*_END anchors in home-stepper-lottie-frame-map.ts together.',
    );
    return;
  }

  // eslint-disable-next-line no-console
  console.log(
    `check-lottie-frames: OK (stepper.lottie totalFrames = ${actual}).`,
  );
}

main().catch((error) => {
  fail(error?.message ?? String(error));
});
