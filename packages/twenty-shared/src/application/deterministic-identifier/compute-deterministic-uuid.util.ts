import { v5 } from 'uuid';

import { type DeterministicEntityNamespace } from '@/application/deterministic-identifier/deterministic-entity-namespace.type';

export const computeDeterministicUuid = ({
  entityNamespace,
  value,
  applicationUniversalIdentifier,
}: {
  entityNamespace: DeterministicEntityNamespace;
  value: string;
  applicationUniversalIdentifier: string;
}): string => v5(`${entityNamespace}:${value}`, applicationUniversalIdentifier);
