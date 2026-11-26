import {
  type FieldMetadataFormula,
  type ValidationRuleBindings,
} from 'twenty-shared/types';
import {
  compileFormulaExpression,
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaExpression,
  getFormulaEvaluationFromBindings,
  isDefined,
  isFormulaFieldMetadata,
  parseExpressionNode,
  printFieldMetadataFormula,
  resolveExpressionFieldReferences,
} from 'twenty-shared/utils';

import {
  buildFormulaFieldDescriptorsFromUniversalFlatEntityMaps,
  type FormulaSourceUniversalFlatFieldMetadata,
  type FormulaSourceUniversalFlatObjectMetadata,
} from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors-from-universal-flat-entity-maps.util';
import { keepStoredFormulaEvaluation } from 'src/engine/metadata-modules/formula-field/utils/keep-stored-formula-evaluation.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// Text that does not compile is left as it is, for the validator to report
export const setFormulaFieldTrees = <
  TUniversalFlatFieldMetadata extends FormulaSourceUniversalFlatFieldMetadata &
    Pick<UniversalFlatFieldMetadata, 'universalSettings'>,
>({
  universalFlatFieldMetadata,
  universalFlatObjectMetadataMaps,
  universalFlatFieldMetadataMaps,
  pendingUniversalFlatFieldMetadatas = [],
}: {
  universalFlatFieldMetadata: TUniversalFlatFieldMetadata;
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
  const universalFlatObjectMetadata =
    universalFlatObjectMetadataMaps.byUniversalIdentifier[
      universalFlatFieldMetadata.objectMetadataUniversalIdentifier
    ];

  if (
    !isDefined(universalSettings) ||
    !isDefined(universalFlatObjectMetadata) ||
    !isFormulaFieldMetadata({ settings: universalSettings })
  ) {
    return universalFlatFieldMetadata;
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
  // A formula sent as a tree is written as its text, so both go through the same compilation
  const { expression, currencyCodeExpression } = isDefined(
    getFieldMetadataFormulaExpression({ settings: universalSettings }),
  )
    ? {
        expression: getFieldMetadataFormulaExpression({
          settings: universalSettings,
        }),
        currencyCodeExpression: getFieldMetadataFormulaCurrencyCodeExpression({
          settings: universalSettings,
        }),
      }
    : printFieldMetadataFormula({ settings: universalSettings, fields });

  if (!isDefined(expression)) {
    return universalFlatFieldMetadata;
  }

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

  if (
    !isDefined(compiledExpression) ||
    (isDefined(currencyCodeExpression) &&
      !isDefined(compiledCurrencyCodeExpression))
  ) {
    return universalFlatFieldMetadata;
  }

  const bindings: ValidationRuleBindings = {
    ...compiledExpression.bindings,
    ...compiledCurrencyCodeExpression?.bindings,
  };
  const formula: FieldMetadataFormula = {
    tree: compiledExpression.tree,
    ...(isDefined(compiledCurrencyCodeExpression)
      ? { currencyCodeTree: compiledCurrencyCodeExpression.tree }
      : {}),
    ...keepStoredFormulaEvaluation(
      getFormulaEvaluationFromBindings({ bindings, fields }),
    ),
  };

  return {
    ...universalFlatFieldMetadata,
    universalSettings: { ...universalSettings, formula },
  };
};
