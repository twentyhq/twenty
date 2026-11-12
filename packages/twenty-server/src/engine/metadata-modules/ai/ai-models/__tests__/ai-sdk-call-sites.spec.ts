import { readdirSync, readFileSync } from 'fs';
import { join, relative } from 'path';

import { isDefined } from 'twenty-shared/utils';
import ts from 'typescript';

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
  ts
    .createSourceFile('source.ts', source, ts.ScriptTarget.Latest)
    .statements.filter(ts.isImportDeclaration)
    .filter(
      ({ moduleSpecifier }) =>
        ts.isStringLiteral(moduleSpecifier) && moduleSpecifier.text === 'ai',
    )
    .some(({ importClause }) => {
      const namedBindings = importClause?.namedBindings;

      if (!isDefined(namedBindings)) {
        return isDefined(importClause?.name);
      }

      return (
        ts.isNamespaceImport(namedBindings) ||
        namedBindings.elements.some(({ name, propertyName }) =>
          MODEL_CALLING_EXPORTS.includes((propertyName ?? name).text),
        )
      );
    });

describe('AI SDK call sites', () => {
  it('only calls models from files that enforce the workspace AI data policy', () => {
    const callSites = listSourceFiles(SRC_DIRECTORY)
      .filter((path) => importsModelCallingExport(readFileSync(path, 'utf8')))
      .map((path) => relative(SRC_DIRECTORY, path))
      .sort();

    expect(callSites).toEqual(POLICY_CHECKED_CALL_SITES);
  });
});
