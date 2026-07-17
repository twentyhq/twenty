import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A system relation field (either side of a default relation to the standard
// relation objects timelineActivity/attachment/noteTarget/taskTarget) is
// identified by the object hosting the field and the object the field points
// to. It is intentionally name-free: both field names are derived from object
// names (the reverse target${capitalize(nameSingular)} morph part and the
// forward field named after the host standard object namePlural), so deriving
// the identifier from a name would tie it to a rename. Keying on the two
// stable object identifiers instead makes any rename a lossless
// fieldMetadata.update. Direction is encoded by the argument order: the
// forward and reverse fields of the same relation swap host and target, so
// they derive distinct identifiers.
//
// Invariant: the `systemRelation` segment and the three-segment shape cannot
// collide with the name-based field identifier (`${objectUID}:${name}`) because
// field names cannot contain colons.
export const getSystemRelationFieldUniversalIdentifier = ({
  applicationUniversalIdentifier,
  hostObjectUniversalIdentifier,
  relationTargetObjectUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  hostObjectUniversalIdentifier: string;
  relationTargetObjectUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'fieldMetadata',
    value: `${hostObjectUniversalIdentifier}:systemRelation:${relationTargetObjectUniversalIdentifier}`,
    applicationUniversalIdentifier,
  });
