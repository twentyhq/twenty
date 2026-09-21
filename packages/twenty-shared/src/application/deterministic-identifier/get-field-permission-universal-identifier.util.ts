import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getFieldPermissionUniversalIdentifier = ({
  applicationUniversalIdentifier,
  roleUniversalIdentifier,
  fieldUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  roleUniversalIdentifier: string;
  fieldUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'fieldPermission',
    value: `${roleUniversalIdentifier}:${fieldUniversalIdentifier}`,
    applicationUniversalIdentifier,
  });
