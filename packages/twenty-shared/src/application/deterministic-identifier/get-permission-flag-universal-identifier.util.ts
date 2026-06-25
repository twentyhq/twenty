import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A permission flag is identified by its key within its application.
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
