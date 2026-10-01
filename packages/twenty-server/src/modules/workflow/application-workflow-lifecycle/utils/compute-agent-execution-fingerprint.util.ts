import { computeExecutionFingerprint } from 'src/modules/workflow/application-workflow-lifecycle/utils/compute-execution-fingerprint.util';
import { type UniversalFlatAgent } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-agent.type';

export const computeAgentExecutionFingerprint = (
  agent: Pick<
    UniversalFlatAgent,
    'prompt' | 'modelId' | 'responseFormat' | 'modelConfiguration'
  >,
): string =>
  computeExecutionFingerprint({
    prompt: agent.prompt,
    modelId: agent.modelId,
    responseFormat: agent.responseFormat ?? null,
    modelConfiguration: agent.modelConfiguration ?? null,
  });
