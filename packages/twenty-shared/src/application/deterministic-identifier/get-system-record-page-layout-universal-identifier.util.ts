import { getPageLayoutUniversalIdentifier } from '@/application/deterministic-identifier/get-page-layout-universal-identifier.util';
import { PageLayoutType } from '@/types';

// An object's singleton record page layout (its name is server-generated),
// keyed on the object + the reserved RECORD_PAGE discriminator through the
// generic name-keyed derivation, so both stay on a single scheme.
export const getSystemRecordPageLayoutUniversalIdentifier = ({
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
    name: PageLayoutType.RECORD_PAGE,
  });
