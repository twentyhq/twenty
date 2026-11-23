import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  compileFormulaExpression,
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaExpression,
  isDefined,
  isFormulaFieldMetadataType,
} from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import {
  buildFormulaFieldDescriptorsFromUniversalFlatEntityMaps,
  type FormulaSourceUniversalFlatFieldMetadata,
  type FormulaSourceUniversalFlatObjectMetadata,
} from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors-from-universal-flat-entity-maps.util';
import { buildFormulaSqlReferenceResolverFromDescriptors } from 'src/engine/metadata-modules/formula-field/utils/build-formula-sql-reference-resolver-from-descriptors.util';
import { compileFormulaFieldToSql } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-field-to-sql.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type FormulaSourceUniversalFlatFieldMetadataMaps = {
  byUniversalIdentifier: Partial<
    Record<string, FormulaSourceUniversalFlatFieldMetadata>
  >;
};

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
  existingUniversalSettings,
  universalFlatObjectMetadataMaps,
  universalFlatFieldMetadataMaps,
  pendingUniversalFlatFieldMetadataMaps,
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
  existingUniversalSettings?: UniversalFlatFieldMetadata['universalSettings'];
  universalFlatObjectMetadataMaps: {
    byUniversalIdentifier: Partial<
      Record<
        string,
        FormulaSourceUniversalFlatObjectMetadata &
          Pick<
            UniversalFlatObjectMetadata,
            'labelIdentifierFieldMetadataUniversalIdentifier'
          >
      >
    >;
  };
  universalFlatFieldMetadataMaps: FormulaSourceUniversalFlatFieldMetadataMaps;
  pendingUniversalFlatFieldMetadataMaps?: FormulaSourceUniversalFlatFieldMetadataMaps;
  isFormulaFieldEnabled: boolean;
}): FlatFieldMetadataValidationError[] => {
  if (
    !isDefined(universalSettings) ||
    !('formula' in universalSettings) ||
    !isDefined(universalSettings.formula)
  ) {
    return [];
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

  // An existing formula stays editable when the flag is turned off
  if (
    !isFormulaFieldEnabled &&
    (expression !==
      getFieldMetadataFormulaExpression({
        settings: existingUniversalSettings,
      }) ||
      getFieldMetadataFormulaCurrencyCodeExpression({
        settings: universalSettings,
      }) !==
        getFieldMetadataFormulaCurrencyCodeExpression({
          settings: existingUniversalSettings,
        }))
  ) {
    return [
      {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: 'Formula fields are not enabled for this workspace',
        userFriendlyMessage: msg`Formula fields are not enabled for this workspace`,
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

  if (isUnique) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'A formula field cannot be unique',
      userFriendlyMessage: msg`A formula field cannot be unique`,
    });
  }

  if (isSearchable) {
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

  const fields = buildFormulaFieldDescriptorsFromUniversalFlatEntityMaps({
    universalFlatObjectMetadata,
    universalFlatObjectMetadataMaps,
    universalFlatFieldMetadataMaps,
    pendingUniversalFlatFieldMetadatas: Object.values(
      pendingUniversalFlatFieldMetadataMaps?.byUniversalIdentifier ?? {},
    ).filter(isDefined),
  }).filter((formulaFieldDescriptor) => formulaFieldDescriptor.name !== name);
  const currencyCodeExpression = getFieldMetadataFormulaCurrencyCodeExpression({
    settings: universalSettings,
  });

  if (
    type === FieldMetadataType.CURRENCY &&
    !isDefined(currencyCodeExpression)
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'A currency formula needs a currency code expression',
      userFriendlyMessage: msg`A currency formula needs a currency code`,
    });
  }

  const toInvalidFormulaError = ({
    errorMessage,
    value,
  }: {
    errorMessage: string;
    value: string;
  }): FlatFieldMetadataValidationError => ({
    code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    message: `Invalid formula: ${errorMessage}`,
    userFriendlyMessage: msg`Invalid formula: ${errorMessage}`,
    value,
  });
  const syntaxErrors = [expression, currencyCodeExpression]
    .filter(isDefined)
    .flatMap((formulaExpression) => {
      const compilation = compileFormulaExpression({
        expression: formulaExpression,
        fields,
      });

      return compilation.isValid
        ? []
        : [
            toInvalidFormulaError({
              errorMessage: compilation.errorMessage,
              value: formulaExpression,
            }),
          ];
    });

  if (errors.length > 0 || syntaxErrors.length > 0) {
    return [...errors, ...syntaxErrors];
  }

  const sqlCompilation = compileFormulaFieldToSql({
    fieldMetadataType: type,
    expression,
    currencyCodeExpression,
    selectEnumSqlType: 'text',
    resolveReference: buildFormulaSqlReferenceResolverFromDescriptors(fields),
  });

  if (!sqlCompilation.isValid) {
    return [
      toInvalidFormulaError({
        errorMessage: sqlCompilation.errorMessage,
        value: expression,
      }),
    ];
  }

  return errors;
};
