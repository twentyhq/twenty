import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// An object permission is identified by its object, within its role.
export const getObjectPermissionUniversalIdentifier = ({
  applicationUniversalIdentifier,
  roleUniversalIdentifier,
  objectUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  roleUniversalIdentifier: string;
  objectUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'objectPermission',
    value: `${roleUniversalIdentifier}:${objectUniversalIdentifier}`,
    applicationUniversalIdentifier,
  });
