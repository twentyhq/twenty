import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';
import {
  type DeterministicEntityType,
  ENTITY_TYPE_NAMESPACE_BY_TYPE,
} from '@/application/deterministic-identifier/entity-type-namespace.constant';

export const computeUniversalIdentifier = ({
  entityType,
  ownerApplicationUniversalIdentifier,
  parentUniversalIdentifier,
  discriminator,
}: {
  entityType: DeterministicEntityType;
  ownerApplicationUniversalIdentifier: string;
  parentUniversalIdentifier: string;
  discriminator: string;
}): string =>
  computeDeterministicUuid(
    `${parentUniversalIdentifier}:${discriminator}`,
    computeDeterministicUuid(
      ownerApplicationUniversalIdentifier,
      ENTITY_TYPE_NAMESPACE_BY_TYPE[entityType],
    ),
  );
