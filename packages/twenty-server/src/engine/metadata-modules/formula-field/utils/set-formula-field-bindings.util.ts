import { type ValidationRuleBindings } from 'twenty-shared/types';
import {
  compileFormulaExpression,
  getFieldMetadataFormulaBindings,
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaExpression,
  isDefined,
} from 'twenty-shared/utils';

import {
  buildFormulaFieldDescriptorsFromUniversalFlatEntityMaps,
  type FormulaSourceUniversalFlatFieldMetadata,
  type FormulaSourceUniversalFlatObjectMetadata,
} from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors-from-universal-flat-entity-maps.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// Bindings are server-owned, and kept while the expression is unchanged so a broken formula still records what it read
export const setFormulaFieldBindings = <
  TUniversalFlatFieldMetadata extends FormulaSourceUniversalFlatFieldMetadata &
    Pick<UniversalFlatFieldMetadata, 'universalSettings'>,
>({
  universalFlatFieldMetadata,
  existingUniversalSettings,
  universalFlatObjectMetadataMaps,
  universalFlatFieldMetadataMaps,
  pendingUniversalFlatFieldMetadatas = [],
}: {
  universalFlatFieldMetadata: TUniversalFlatFieldMetadata;
  existingUniversalSettings?: UniversalFlatFieldMetadata['universalSettings'];
  universalFlatObjectMetadataMaps: {
    byUniversalIdentifier: Partial<
      Record<string, FormulaSourceUniversalFlatObjectMetadata>
    >;
  };
  universalFlatFieldMetadataMaps: {
    byUniversalIdentifier: Partial<
      Record<string, FormulaSourceUniversalFlatFieldMetadata>
    >;
  };
  pendingUniversalFlatFieldMetadatas?: FormulaSourceUniversalFlatFieldMetadata[];
}): TUniversalFlatFieldMetadata => {
  const { universalSettings, universalIdentifier, name } =
    universalFlatFieldMetadata;
  const expression = getFieldMetadataFormulaExpression({
    settings: universalSettings,
  });
  const universalFlatObjectMetadata =
    universalFlatObjectMetadataMaps.byUniversalIdentifier[
      universalFlatFieldMetadata.objectMetadataUniversalIdentifier
    ];

  if (!isDefined(expression) || !isDefined(universalSettings)) {
    return universalFlatFieldMetadata;
  }

  const currencyCodeExpression = getFieldMetadataFormulaCurrencyCodeExpression({
    settings: universalSettings,
  });
  const isUnchanged =
    expression ===
      getFieldMetadataFormulaExpression({
        settings: existingUniversalSettings,
      }) &&
    currencyCodeExpression ===
      getFieldMetadataFormulaCurrencyCodeExpression({
        settings: existingUniversalSettings,
      });
  const existingBindings = isUnchanged
    ? getFieldMetadataFormulaBindings({ settings: existingUniversalSettings })
    : undefined;

  const computeBindings = (): ValidationRuleBindings => {
    if (!isDefined(universalFlatObjectMetadata)) {
      return {};
    }

    const fields = buildFormulaFieldDescriptorsFromUniversalFlatEntityMaps({
      universalFlatObjectMetadata,
      universalFlatObjectMetadataMaps,
      universalFlatFieldMetadataMaps,
      pendingUniversalFlatFieldMetadatas:
        pendingUniversalFlatFieldMetadatas.filter(
          (pendingUniversalFlatFieldMetadata) =>
            pendingUniversalFlatFieldMetadata.universalIdentifier !==
            universalIdentifier,
        ),
    }).filter((formulaFieldDescriptor) => formulaFieldDescriptor.name !== name);

    return [expression, currencyCodeExpression]
      .filter(isDefined)
      .reduce<ValidationRuleBindings>((bindings, formulaExpression) => {
        const compilation = compileFormulaExpression({
          expression: formulaExpression,
          fields,
        });

        return compilation.isValid
          ? { ...bindings, ...compilation.bindings }
          : bindings;
      }, {});
  };

  return {
    ...universalFlatFieldMetadata,
    universalSettings: {
      ...universalSettings,
      formula: {
        expression,
        ...(isDefined(currencyCodeExpression)
          ? { currencyCodeExpression }
          : {}),
        bindings: existingBindings ?? computeBindings(),
      },
    },
  };
};
