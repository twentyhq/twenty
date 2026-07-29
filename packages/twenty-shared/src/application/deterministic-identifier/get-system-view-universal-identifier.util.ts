import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';
import { type ViewKey } from '@/types/ViewKey';

export const getSystemViewUniversalIdentifier = ({
  applicationUniversalIdentifier,
  objectUniversalIdentifier,
  viewKey,
}: {
  applicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  viewKey: ViewKey;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'view',
    value: `${objectUniversalIdentifier}:${viewKey}`,
    applicationUniversalIdentifier,
  });
