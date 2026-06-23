import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// An index is identified by its generated Postgres name (table + ordered columns
// + uniqueness + where-clause); a name change means a different index.
export const getIndexUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  objectUniversalIdentifier,
  name,
}: {
  ownerApplicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  name: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'index',
    value: `${objectUniversalIdentifier}:${name}`,
    applicationUniversalIdentifier: ownerApplicationUniversalIdentifier,
  });
