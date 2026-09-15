import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getPermissionFlagUniversalIdentifier = ({
  applicationUniversalIdentifier,
  key,
}: {
  applicationUniversalIdentifier: string;
  key: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'permissionFlag',
    value: key,
    applicationUniversalIdentifier,
  });
