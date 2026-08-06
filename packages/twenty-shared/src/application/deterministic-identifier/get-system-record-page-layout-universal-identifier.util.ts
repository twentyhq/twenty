import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';
import { PageLayoutType } from '@/types';

export const getSystemRecordPageLayoutUniversalIdentifier = ({
  objectMetadataApplicationUniversalIdentifier,
  objectUniversalIdentifier,
}: {
  objectMetadataApplicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'pageLayout',
    value: `${objectUniversalIdentifier}:${PageLayoutType.RECORD_PAGE}`,
    applicationUniversalIdentifier: objectMetadataApplicationUniversalIdentifier,
  });
