/* @license Enterprise */

import { msg, t } from '@lingui/core/macro';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataSideEffectFailure } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

export const buildReservedFieldNameValidationRuleFailure = ({
  fieldUniversalIdentifier,
  newFieldName,
  validationRuleName,
}: {
  fieldUniversalIdentifier: string;
  newFieldName: string;
  validationRuleName: string;
}): MetadataSideEffectFailure => ({
  status: 'fail',
  type: 'update',
  metadataName: 'fieldMetadata',
  flatEntityMinimalInformation: {
    universalIdentifier: fieldUniversalIdentifier,
    name: newFieldName,
  } as Partial<MetadataFlatEntity<'fieldMetadata'>>,
  errors: [
    {
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`"${newFieldName}" is a reserved word in validation rules and the rule "${validationRuleName}" reads this field`,
      userFriendlyMessage: msg`"${newFieldName}" is a reserved word in validation rules and the rule "${validationRuleName}" reads this field. Choose another name or update the rule first.`,
    },
  ],
});
