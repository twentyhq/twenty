import {
  type FieldMetadataFormula,
  type ValidationRuleBindings,
} from 'twenty-shared/types';
import {
  compileFormulaExpression,
  getFieldMetadataFormulaBindings,
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaEvaluation,
  getFieldMetadataFormulaExpression,
  getFieldMetadataFormulaTree,
  getFormulaEvaluationFromBindings,
  isDefined,
  parseExpressionNode,
  resolveExpressionFieldReferences,
} from 'twenty-shared/utils';

import {
  buildFormulaFieldDescriptorsFromUniversalFlatEntityMaps,
  type FormulaSourceUniversalFlatFieldMetadata,
  type FormulaSourceUniversalFlatObjectMetadata,
} from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors-from-universal-flat-entity-maps.util';
import { keepStoredFormulaEvaluation } from 'src/engine/metadata-modules/formula-field/utils/keep-stored-formula-evaluation.util';
import { isFieldMetadataFormulaUnchanged } from 'src/engine/metadata-modules/formula-field/utils/is-field-metadata-formula-unchanged.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// Bindings and evaluation are server-owned, and kept while the expression is unchanged so a broken formula still records what it read
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
  const existingBindings = isFieldMetadataFormulaUnchanged({
    settings: universalSettings,
    existingSettings: existingUniversalSettings,
  })
    ? getFieldMetadataFormulaBindings({ settings: existingUniversalSettings })
    : undefined;

  const getDerivedSettings = (): Pick<
    FieldMetadataFormula,
    'bindings' | 'evaluation' | 'tree' | 'currencyCodeTree'
  > => {
    if (isDefined(existingBindings)) {
      const existingTree = getFieldMetadataFormulaTree({
        settings: existingUniversalSettings,
      });
      const existingCurrencyCodeTree = getFieldMetadataFormulaTree({
        settings: existingUniversalSettings,
        isCurrencyCode: true,
      });

      return {
        bindings: existingBindings,
        ...(isDefined(existingTree) ? { tree: existingTree } : {}),
        ...(isDefined(existingCurrencyCodeTree)
          ? { currencyCodeTree: existingCurrencyCodeTree }
          : {}),
        ...keepStoredFormulaEvaluation(
          getFieldMetadataFormulaEvaluation({
            settings: existingUniversalSettings,
          }),
        ),
      };
    }

    if (!isDefined(universalFlatObjectMetadata)) {
      return { bindings: {} };
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

    const compileToTree = (formulaExpression: string) => {
      const compilation = compileFormulaExpression({
        expression: formulaExpression,
        fields,
      });
      const parsing = parseExpressionNode(formulaExpression);

      return compilation.isValid && parsing.isValid
        ? {
            bindings: compilation.bindings,
            tree: resolveExpressionFieldReferences({
              node: parsing.node,
              fields,
            }),
          }
        : undefined;
    };

    const compiledExpression = compileToTree(expression);
    const compiledCurrencyCodeExpression = isDefined(currencyCodeExpression)
      ? compileToTree(currencyCodeExpression)
      : undefined;
    const bindings: ValidationRuleBindings = {
      ...compiledExpression?.bindings,
      ...compiledCurrencyCodeExpression?.bindings,
    };

    return {
      bindings,
      ...(isDefined(compiledExpression)
        ? { tree: compiledExpression.tree }
        : {}),
      ...(isDefined(compiledCurrencyCodeExpression)
        ? { currencyCodeTree: compiledCurrencyCodeExpression.tree }
        : {}),
      ...keepStoredFormulaEvaluation(
        getFormulaEvaluationFromBindings({ bindings, fields }),
      ),
    };
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
        ...getDerivedSettings(),
      },
    },
  };
};
