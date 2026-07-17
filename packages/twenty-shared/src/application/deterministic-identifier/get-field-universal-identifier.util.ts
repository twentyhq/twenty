import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A field is identified by its name within its object. System relation fields
// (either side of a default relation to the standard relation objects) are the
// exception: their names are object-name-derived, so they use the name-free
// derivation of getSystemRelationFieldUniversalIdentifier instead - see
// getDefaultRelationFieldUniversalIdentifier for the app-facing entry point.
export const getFieldUniversalIdentifier = ({
  applicationUniversalIdentifier,
  objectUniversalIdentifier,
  name,
}: {
  applicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  name: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'fieldMetadata',
    value: `${objectUniversalIdentifier}:${name}`,
    applicationUniversalIdentifier,
  });
