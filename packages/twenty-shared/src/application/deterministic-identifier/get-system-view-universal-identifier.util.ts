import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';
import { type ViewKey } from '@/types/ViewKey';

export const getSystemViewUniversalIdentifier = ({
  objectMetadataApplicationUniversalIdentifier,
  objectUniversalIdentifier,
  viewKey,
}: {
  objectMetadataApplicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  viewKey: ViewKey;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'view',
    value: `${objectUniversalIdentifier}:${viewKey}`,
    applicationUniversalIdentifier:
      objectMetadataApplicationUniversalIdentifier,
  });
