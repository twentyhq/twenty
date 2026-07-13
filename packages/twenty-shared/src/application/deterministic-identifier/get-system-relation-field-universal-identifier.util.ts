import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A system relation reverse field (e.g. the target* morph field on a standard
// object like timelineActivity/attachment/noteTarget/taskTarget) is identified
// by the host object carrying it and the source object it points back to. It is
// intentionally name-free: the reverse field name is dynamic
// (target${capitalize(nameSingular)}), so deriving the identifier from the name
// would make an object rename mutate the field identifier — forcing a lossy
// delete+create. Keying on the two stable object identifiers instead makes a
// rename a lossless fieldMetadata.update.
//
// Invariant: the `systemRelation` segment and the three-segment shape cannot
// collide with the name-based field identifier (`${objectUID}:${name}`) because
// field names cannot contain colons.
export const getSystemRelationFieldUniversalIdentifier = ({
  applicationUniversalIdentifier,
  hostObjectUniversalIdentifier,
  sourceObjectUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  hostObjectUniversalIdentifier: string;
  sourceObjectUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'fieldMetadata',
    value: `${hostObjectUniversalIdentifier}:systemRelation:${sourceObjectUniversalIdentifier}`,
    applicationUniversalIdentifier,
  });
