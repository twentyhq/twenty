import { readdirSync, readFileSync } from 'fs';
import { join, relative } from 'path';

// a new call site must enforce the workspace AI data policy before it is listed
const POLICY_CHECKED_CALL_SITES = [
  'engine/metadata-modules/ai/ai-agent-execution/services/agent-run-turn.service.ts',
  'engine/metadata-modules/ai/ai-agent-execution/services/agent-step-loop.service.ts',
  'engine/metadata-modules/ai/ai-agent/utils/repair-tool-call.util.ts',
  'engine/metadata-modules/ai/ai-chat/services/agent-title-generation.service.ts',
  'engine/metadata-modules/ai/ai-evaluation/services/native-evaluation.runner.ts',
  'engine/metadata-modules/ai/ai-generate-text/controllers/ai-generate-text.controller.ts',
];

const MODEL_CALLING_EXPORTS = [
  'generateText',
  'streamText',
  'generateObject',
  'streamObject',
  'embed',
  'embedMany',
  'experimental_evaluate',
  'experimental_transcribe',
  'experimental_generateImage',
  'experimental_generateSpeech',
];

const SRC_DIRECTORY = join(__dirname, '../../../../..');

const listSourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : listSourceFiles(path);
    }

    return entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')
      ? [path]
      : [];
  });

const importsModelCallingExport = (source: string): boolean =>
  Array.from(source.matchAll(/import\s*\{([^}]*)\}\s*from\s*'ai'/g)).some(
    ([, specifiers]) =>
      specifiers
        .split(',')
        .map((specifier) => specifier.trim().split(/\s+as\s+/)[0])
        .some((name) => MODEL_CALLING_EXPORTS.includes(name)),
  );

describe('AI SDK call sites', () => {
  it('only calls models from files that enforce the workspace AI data policy', () => {
    const callSites = listSourceFiles(SRC_DIRECTORY)
      .filter((path) => importsModelCallingExport(readFileSync(path, 'utf8')))
      .map((path) => relative(SRC_DIRECTORY, path))
      .sort();

    expect(callSites).toEqual(POLICY_CHECKED_CALL_SITES);
  });
});
