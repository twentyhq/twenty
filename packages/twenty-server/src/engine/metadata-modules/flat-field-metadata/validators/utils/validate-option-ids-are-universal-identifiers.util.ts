import { msg, t } from '@lingui/core/macro';
import { isValidUniversalIdentifier } from 'twenty-shared/application';
import { type EnumFieldMetadataType } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// Option ids become option rows' universal identifiers; malformed ids are reported by the input validator.
export const validateOptionIdsAreUniversalIdentifiers = ({
  options,
}: Pick<
  UniversalFlatFieldMetadata<EnumFieldMetadataType>,
  'options'
>): FlatFieldMetadataValidationError[] =>
  (options ?? [])
    .filter(
      ({ id }) =>
        isDefined(id) &&
        isValidUuid(id) &&
        (!isValidUniversalIdentifier(id) || id !== id.toLowerCase()),
    )
    .map(({ id }) => ({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option id must be a lowercase UUID of version 4 or later`,
      userFriendlyMessage: msg`Option id must be a lowercase UUID of version 4 or later`,
      value: id,
    }));
