import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

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
