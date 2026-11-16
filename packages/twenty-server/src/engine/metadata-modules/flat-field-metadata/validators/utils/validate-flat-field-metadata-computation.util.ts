import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// Nothing reads a computation yet, so a field that has one would have no value
export const validateFlatFieldMetadataComputation = ({
  computation,
  name,
}: Pick<
  UniversalFlatFieldMetadata,
  'computation' | 'name'
>): FlatFieldMetadataValidationError[] =>
  isDefined(computation)
    ? [
        {
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message: `Invalid computation for field "${name}": computed fields are not available yet`,
          userFriendlyMessage: msg`Computed fields are not available yet`,
          value: computation,
        },
      ]
    : [];
