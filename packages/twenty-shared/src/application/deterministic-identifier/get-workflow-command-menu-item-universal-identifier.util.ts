import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

const WORKFLOW_COMMAND_DISCRIMINATOR = 'workflow';

export const getWorkflowCommandMenuItemUniversalIdentifier = ({
  applicationUniversalIdentifier,
  workflowUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  workflowUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'commandMenuItem',
    value: `${workflowUniversalIdentifier}:${WORKFLOW_COMMAND_DISCRIMINATOR}`,
    applicationUniversalIdentifier,
  });
