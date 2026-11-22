import { msg } from '@lingui/core/macro';
import {
  compileFormulaExpression,
  getFieldMetadataFormulaExpression,
  isDefined,
  isFormulaFieldMetadataType,
} from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { buildFormulaFieldDescriptorsFromUniversalFlatEntityMaps } from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors-from-universal-flat-entity-maps.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type BuildFormulaFieldDescriptorsArgs = Parameters<
  typeof buildFormulaFieldDescriptorsFromUniversalFlatEntityMaps
>[0];

export const validateFlatFieldMetadataFormula = ({
  flatFieldMetadataToValidate: {
    name,
    type,
    universalIdentifier,
    universalSettings,
    objectMetadataUniversalIdentifier,
    isUnique,
    isSearchable,
  },
  universalFlatObjectMetadataMaps,
  universalFlatFieldMetadataMaps,
  pendingUniversalFlatFieldMetadatas,
  isFormulaFieldEnabled,
}: {
  flatFieldMetadataToValidate: Pick<
    UniversalFlatFieldMetadata,
    | 'name'
    | 'type'
    | 'universalIdentifier'
    | 'universalSettings'
    | 'objectMetadataUniversalIdentifier'
    | 'isUnique'
    | 'isSearchable'
  >;
  universalFlatObjectMetadataMaps: {
    byUniversalIdentifier: Partial<
      Record<
        string,
        BuildFormulaFieldDescriptorsArgs['universalFlatObjectMetadata'] &
          Pick<
            UniversalFlatObjectMetadata,
            'labelIdentifierFieldMetadataUniversalIdentifier'
          >
      >
    >;
  };
  universalFlatFieldMetadataMaps: BuildFormulaFieldDescriptorsArgs['universalFlatFieldMetadataMaps'];
  pendingUniversalFlatFieldMetadatas: BuildFormulaFieldDescriptorsArgs['pendingUniversalFlatFieldMetadatas'];
  isFormulaFieldEnabled: boolean;
}): FlatFieldMetadataValidationError[] => {
  if (
    !isDefined(universalSettings) ||
    !('formula' in universalSettings) ||
    !isDefined(universalSettings.formula)
  ) {
    return [];
  }

  if (!isFormulaFieldEnabled) {
    return [
      {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: 'Formula fields are not enabled for this workspace',
        userFriendlyMessage: msg`Formula fields are not enabled for this workspace`,
      },
    ];
  }

  if (!isFormulaFieldMetadataType(type)) {
    return [
      {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: `Field type ${type} does not support formulas`,
        userFriendlyMessage: msg`This field type does not support formulas`,
        value: type,
      },
    ];
  }

  const expression = getFieldMetadataFormulaExpression({
    settings: universalSettings,
  });

  if (!isDefined(expression)) {
    return [
      {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: 'Formula must have a non-empty expression',
        userFriendlyMessage: msg`A formula needs an expression`,
        value: universalSettings.formula,
      },
    ];
  }

  const universalFlatObjectMetadata =
    universalFlatObjectMetadataMaps.byUniversalIdentifier[
      objectMetadataUniversalIdentifier
    ];

  if (!isDefined(universalFlatObjectMetadata)) {
    return [];
  }

  const errors: FlatFieldMetadataValidationError[] = [];

  if (isUnique === true) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'A formula field cannot be unique',
      userFriendlyMessage: msg`A formula field cannot be unique`,
    });
  }

  if (isSearchable === true) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'A formula field cannot be searchable',
      userFriendlyMessage: msg`A formula field cannot be searched`,
    });
  }

  if (
    universalFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier ===
    universalIdentifier
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'The label identifier field cannot be a formula',
      userFriendlyMessage: msg`The field used as record label cannot be a formula`,
    });
  }

  const compilation = compileFormulaExpression({
    expression,
    fields: buildFormulaFieldDescriptorsFromUniversalFlatEntityMaps({
      universalFlatObjectMetadata,
      universalFlatObjectMetadataMaps,
      universalFlatFieldMetadataMaps,
      pendingUniversalFlatFieldMetadatas,
    }).filter((formulaFieldDescriptor) => formulaFieldDescriptor.name !== name),
  });

  if (!compilation.isValid) {
    const errorMessage = compilation.errorMessage;

    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: `Invalid formula: ${errorMessage}`,
      userFriendlyMessage: msg`Invalid formula: ${errorMessage}`,
      value: expression,
    });
  }

  return errors;
};
