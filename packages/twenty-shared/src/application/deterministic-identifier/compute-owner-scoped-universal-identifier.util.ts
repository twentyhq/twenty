import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const computeOwnerScopedUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  namespace,
  value,
}: {
  ownerApplicationUniversalIdentifier: string;
  namespace: string;
  value: string;
}): string =>
  computeDeterministicUuid(
    value,
    computeDeterministicUuid(ownerApplicationUniversalIdentifier, namespace),
  );
