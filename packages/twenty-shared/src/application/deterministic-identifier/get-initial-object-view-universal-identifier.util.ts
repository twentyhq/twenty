import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

const INITIAL_OBJECT_VIEW_KEY = 'INITIAL' as const;

export const getInitialObjectViewUniversalIdentifier = ({
  viewApplicationUniversalIdentifier,
  objectUniversalIdentifier,
}: {
  viewApplicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'view',
    value: `${objectUniversalIdentifier}:${INITIAL_OBJECT_VIEW_KEY}`,
    applicationUniversalIdentifier: viewApplicationUniversalIdentifier,
  });
