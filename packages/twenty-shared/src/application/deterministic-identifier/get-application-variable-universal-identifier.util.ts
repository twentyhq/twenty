import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getApplicationVariableUniversalIdentifier = ({
  applicationUniversalIdentifier,
  key,
}: {
  applicationUniversalIdentifier: string;
  key: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'applicationVariable',
    value: key,
    applicationUniversalIdentifier,
  });
