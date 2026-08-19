import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getConnectionProviderUniversalIdentifier = ({
  applicationUniversalIdentifier,
  name,
}: {
  applicationUniversalIdentifier: string;
  name: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'connectionProvider',
    value: name,
    applicationUniversalIdentifier,
  });
