import { msg } from '@lingui/core/macro';
import { type FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataTypeValidationArgs } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { isSafeTsVectorExpression } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { isDefined } from 'twenty-shared/utils';

export const validateTsVectorFlatFieldMetadata = ({
  flatEntityToValidate,
}: FlatFieldMetadataTypeValidationArgs<FieldMetadataType.TS_VECTOR>): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  if (flatEntityToValidate.name !== 'searchVector') {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: `Field type TS_VECTOR must be named "searchVector", got "${flatEntityToValidate.name}"`,
      value: flatEntityToValidate.name,
      userFriendlyMessage: msg`Field type TS_VECTOR must be named "searchVector"`,
    });
  }

  if (!flatEntityToValidate.isSystem) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'Field type TS_VECTOR must be a system field',
      value: flatEntityToValidate.isSystem,
      userFriendlyMessage: msg`Field type TS_VECTOR must be a system field`,
    });
  }

  const asExpression = flatEntityToValidate.universalSettings?.asExpression;

  if (!isDefined(asExpression)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message:
        'Field type TS_VECTOR must have an expression. This may have failed to be built because record identifier field does not exist or is not of a searchable type.',
      userFriendlyMessage: msg`Field type TS_VECTOR must have an expression. This may have failed to be built because record identifier field does not exist or is not of a searchable type.`,
    });
  } else if (!isSafeTsVectorExpression(asExpression)) {
    // The asExpression is concatenated into generated-column DDL (GENERATED ALWAYS AS (...)).
    // Whatever path produced it (server generation, app-sync manifest, label-identifier
    // recompute), reject any corrupted expression that could break out of the wrapping clause.
    // The message is intentionally generic so it cannot be used to probe the filter.
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'Field type TS_VECTOR expression is invalid',
      userFriendlyMessage: msg`The search field expression is invalid.`,
    });
  }

  return errors;
};
