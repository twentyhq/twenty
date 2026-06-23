import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A field permission is identified by its field (which implies its object), within its role.
export const getFieldPermissionUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  roleUniversalIdentifier,
  fieldUniversalIdentifier,
}: {
  ownerApplicationUniversalIdentifier: string;
  roleUniversalIdentifier: string;
  fieldUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'fieldPermission',
    value: `${roleUniversalIdentifier}:${fieldUniversalIdentifier}`,
    applicationUniversalIdentifier: ownerApplicationUniversalIdentifier,
  });
