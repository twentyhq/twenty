import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A role is identified by its label within its application.
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
