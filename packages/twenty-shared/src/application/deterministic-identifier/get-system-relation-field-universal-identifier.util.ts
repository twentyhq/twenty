import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A system relation field (either side of a default relation to the standard
// relation objects timelineActivity/attachment/noteTarget/taskTarget) is
// identified by the object hosting the field (objectUniversalIdentifier) and
// the object the field points to (relationTargetObjectUniversalIdentifier).
// It is intentionally name-free: both field names are derived from object
// names (the reverse target${capitalize(nameSingular)} morph part and the
// forward field named after the standard relation object namePlural), so
// deriving the identifier from a name would tie it to a rename. Keying on the
// two stable object identifiers instead makes any rename a lossless
// fieldMetadata.update. Direction is encoded by the argument order: the
// forward field (e.g. rocket.attachments) is hosted on your object and points
// at the standard relation object, the reverse field (e.g.
// attachment.targetRocket) swaps the two.
//
// Invariant: the `systemRelation` segment and the three-segment shape cannot
// collide with the name-based field identifier (`${objectUID}:${name}`) because
// field names cannot contain colons.
export const getSystemRelationFieldUniversalIdentifier = ({
  applicationUniversalIdentifier,
  objectUniversalIdentifier,
  relationTargetObjectUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  relationTargetObjectUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'fieldMetadata',
    value: `${objectUniversalIdentifier}:systemRelation:${relationTargetObjectUniversalIdentifier}`,
    applicationUniversalIdentifier,
  });
