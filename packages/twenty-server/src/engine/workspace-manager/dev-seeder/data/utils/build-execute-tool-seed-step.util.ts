import { isDefined } from 'twenty-shared/utils';

import { type SeededToolStep } from 'src/engine/workspace-manager/dev-seeder/data/utils/seeded-tool-step.type';

type SeededRecordReference = {
  objectNameSingular: string;
  recordId: string;
  displayName: string;
};

export const buildExecuteToolSeedStep = ({
  toolName,
  toolArguments,
  message,
  result,
  recordReferences,
  errorText,
  reasoning,
}: {
  toolName: string;
  toolArguments: Record<string, unknown>;
  message?: string;
  result?: Record<string, unknown>;
  recordReferences?: SeededRecordReference[];
  errorText?: string;
  reasoning?: string;
}): SeededToolStep => ({
  toolName: 'execute_tool',
  input: { toolName, arguments: toolArguments },
  output: isDefined(errorText)
    ? undefined
    : {
        success: true,
        message,
        result,
        ...(isDefined(recordReferences) ? { recordReferences } : {}),
      },
  errorText,
  reasoning,
});
