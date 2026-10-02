import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getWorkflowVersionUniversalIdentifier = ({
  applicationUniversalIdentifier,
  workflowUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  workflowUniversalIdentifier: string;
}): string => {
  return computeDeterministicUuid({
    entityNamespace: 'workflowVersion',
    value: workflowUniversalIdentifier,
    applicationUniversalIdentifier,
  });
};
