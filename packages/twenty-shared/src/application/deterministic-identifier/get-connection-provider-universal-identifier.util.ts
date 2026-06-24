import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A connection provider is identified by its name within its application.
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
