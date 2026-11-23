import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  compileFormulaExpression,
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaExpression,
  isDefined,
  isValidationRuleReservedName,
  renameValidationRuleExpressionFields,
} from 'twenty-shared/utils';

import {
  buildFormulaFieldDescriptorsFromUniversalFlatEntityMaps,
  type FormulaSourceUniversalFlatObjectMetadata,
} from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors-from-universal-flat-entity-maps.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

type UniversalFlatFieldMetadataByUniversalIdentifier = Partial<
  Record<string, UniversalFlatFieldMetadata>
>;

export const computeFormulaFieldUpdatesAfterFieldRename = ({
  renamedFieldUniversalIdentifier,
  previousFieldName,
  newFieldName,
  universalFlatObjectMetadataMaps,
  existingUniversalFlatFieldMetadataByUniversalIdentifier,
  pendingUniversalFlatFieldMetadataUpdateByUniversalIdentifier,
  deletedUniversalFlatFieldMetadataByUniversalIdentifier,
}: {
  renamedFieldUniversalIdentifier: string;
  previousFieldName: string;
  newFieldName: string;
  universalFlatObjectMetadataMaps: {
    byUniversalIdentifier: Partial<
      Record<string, FormulaSourceUniversalFlatObjectMetadata>
    >;
  };
  existingUniversalFlatFieldMetadataByUniversalIdentifier: UniversalFlatFieldMetadataByUniversalIdentifier;
  pendingUniversalFlatFieldMetadataUpdateByUniversalIdentifier: UniversalFlatFieldMetadataByUniversalIdentifier;
  deletedUniversalFlatFieldMetadataByUniversalIdentifier: UniversalFlatFieldMetadataByUniversalIdentifier;
}): Record<string, UniversalFlatFieldMetadata> => {
  // A reserved name would change what the rewritten expression means, so the formula is left to fail
  if (isValidationRuleReservedName({ name: newFieldName, isMember: false })) {
    return {};
  }

  const fieldNameByUniversalIdentifier = new Map([
    [renamedFieldUniversalIdentifier, newFieldName],
  ]);
  const fieldDescriptorsByObjectUniversalIdentifier = new Map<
    string,
    ValidationRuleFieldDescriptor[]
  >();
  const universalFlatFieldMetadataToUpdate: Record<
    string,
    UniversalFlatFieldMetadata
  > = {};

  for (const existingUniversalFlatFieldMetadata of Object.values(
    existingUniversalFlatFieldMetadataByUniversalIdentifier,
  )) {
    if (!isDefined(existingUniversalFlatFieldMetadata)) {
      continue;
    }

    const { universalIdentifier, objectMetadataUniversalIdentifier } =
      existingUniversalFlatFieldMetadata;
    const universalFlatFieldMetadata =
      pendingUniversalFlatFieldMetadataUpdateByUniversalIdentifier[
        universalIdentifier
      ] ?? existingUniversalFlatFieldMetadata;
    const settings = universalFlatFieldMetadata.universalSettings;
    const expression = getFieldMetadataFormulaExpression({ settings });
    const currencyCodeExpression =
      getFieldMetadataFormulaCurrencyCodeExpression({ settings });
    const universalFlatObjectMetadata =
      universalFlatObjectMetadataMaps.byUniversalIdentifier[
        objectMetadataUniversalIdentifier
      ];

    if (
      !isDefined(expression) ||
      ![expression, currencyCodeExpression].some((formulaExpression) =>
        formulaExpression?.includes(previousFieldName),
      ) ||
      !isDefined(universalFlatObjectMetadata) ||
      isDefined(
        deletedUniversalFlatFieldMetadataByUniversalIdentifier[
          universalIdentifier
        ],
      )
    ) {
      continue;
    }

    const fields =
      fieldDescriptorsByObjectUniversalIdentifier.get(
        objectMetadataUniversalIdentifier,
      ) ??
      buildFormulaFieldDescriptorsFromUniversalFlatEntityMaps({
        universalFlatObjectMetadata,
        universalFlatObjectMetadataMaps,
        universalFlatFieldMetadataMaps: {
          byUniversalIdentifier:
            existingUniversalFlatFieldMetadataByUniversalIdentifier,
        },
      });

    fieldDescriptorsByObjectUniversalIdentifier.set(
      objectMetadataUniversalIdentifier,
      fields,
    );

    const renameExpression = (formulaExpression: string): string => {
      const compilation = compileFormulaExpression({
        expression: formulaExpression,
        fields,
      });

      return compilation.isValid
        ? renameValidationRuleExpressionFields({
            expression: formulaExpression,
            bindings: compilation.bindings,
            fieldNameByUniversalIdentifier,
          })
        : formulaExpression;
    };
    const renamedExpression = renameExpression(expression);
    const renamedCurrencyCodeExpression = isDefined(currencyCodeExpression)
      ? renameExpression(currencyCodeExpression)
      : undefined;

    if (
      renamedExpression === expression &&
      renamedCurrencyCodeExpression === currencyCodeExpression
    ) {
      continue;
    }

    universalFlatFieldMetadataToUpdate[universalIdentifier] = {
      ...universalFlatFieldMetadata,
      universalSettings: {
        ...settings,
        formula: {
          expression: renamedExpression,
          ...(isDefined(renamedCurrencyCodeExpression)
            ? { currencyCodeExpression: renamedCurrencyCodeExpression }
            : {}),
        },
      },
    };
  }

  return universalFlatFieldMetadataToUpdate;
};
