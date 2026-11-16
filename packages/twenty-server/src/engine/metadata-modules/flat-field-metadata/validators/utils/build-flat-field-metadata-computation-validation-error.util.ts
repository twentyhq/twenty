import { msg } from '@lingui/core/macro';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export const buildFlatFieldMetadataComputationValidationError = ({
  flatFieldMetadata: { name, computation },
  message,
}: {
  flatFieldMetadata: Pick<UniversalFlatFieldMetadata, 'name' | 'computation'>;
  message: string;
}): FlatFieldMetadataValidationError => ({
  code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
  message: `Invalid computation for field "${name}": ${message}`,
  userFriendlyMessage: msg`The computation of this field is invalid`,
  value: computation,
});
