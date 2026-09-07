import { msg } from '@lingui/core/macro';
import {
  FIELD_LINKS_VARIANTS,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataTypeValidationArgs } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';

export const validateLinksFlatFieldMetadata = ({
  flatEntityToValidate,
}: FlatFieldMetadataTypeValidationArgs<FieldMetadataType.LINKS>): FlatFieldMetadataValidationError[] => {
  const variant = flatEntityToValidate?.universalSettings?.type;

  if (isDefined(variant) && !FIELD_LINKS_VARIANTS.includes(variant)) {
    return [
      {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: `Links field type must be one of ${FIELD_LINKS_VARIANTS.join(', ')}`,
        userFriendlyMessage: msg`Links field type must be either a url or a domain`,
      },
    ];
  }

  return [];
};
