import {
  getSystemPageLayoutTabUniversalIdentifier,
  getSystemRecordFormPageLayoutUniversalIdentifier,
} from 'twenty-shared/application';

import { RECORD_FORM_TAB_PROPS } from 'src/engine/metadata-modules/metadata-side-effect/constants/record-form-tab-props.constant';

export const getRecordFormPageLayoutTabUniversalIdentifier = ({
  objectApplicationUniversalIdentifier,
  objectMetadataUniversalIdentifier,
}: {
  objectApplicationUniversalIdentifier: string;
  objectMetadataUniversalIdentifier: string;
}): string =>
  getSystemPageLayoutTabUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      objectApplicationUniversalIdentifier,
    pageLayoutUniversalIdentifier:
      getSystemRecordFormPageLayoutUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
          objectApplicationUniversalIdentifier,
        objectUniversalIdentifier: objectMetadataUniversalIdentifier,
      }),
    title: RECORD_FORM_TAB_PROPS.title,
  });
