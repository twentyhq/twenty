import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getRoleUniversalIdentifier = ({
  applicationUniversalIdentifier,
  label,
}: {
  applicationUniversalIdentifier: string;
  label: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'role',
    value: label,
    applicationUniversalIdentifier,
  });
