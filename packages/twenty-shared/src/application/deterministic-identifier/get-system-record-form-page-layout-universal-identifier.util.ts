import { getPageLayoutUniversalIdentifier } from '@/application/deterministic-identifier/get-page-layout-universal-identifier.util';
import { PageLayoutType } from '@/types';

export const getSystemRecordFormPageLayoutUniversalIdentifier = ({
  objectMetadataApplicationUniversalIdentifier,
  objectUniversalIdentifier,
}: {
  objectMetadataApplicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
}): string =>
  getPageLayoutUniversalIdentifier({
    applicationUniversalIdentifier:
      objectMetadataApplicationUniversalIdentifier,
    objectUniversalIdentifier,
    name: PageLayoutType.RECORD_FORM,
  });
