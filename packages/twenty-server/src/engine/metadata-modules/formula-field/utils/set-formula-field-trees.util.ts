import {
  type FieldMetadataFormula,
  type ValidationRuleBindings,
} from 'twenty-shared/types';
import {
  compileFormulaExpression,
  getFieldMetadataFormulaEvaluation,
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

// Text that does not compile is left as it is, for the validator to report
export const setFormulaFieldTrees = <
  TUniversalFlatFieldMetadata extends FormulaSourceUniversalFlatFieldMetadata,
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
  const {
    formula: writtenFormula,
    universalIdentifier,
    name,
  } = universalFlatFieldMetadata;
  const universalFlatObjectMetadata =
    universalFlatObjectMetadataMaps.byUniversalIdentifier[
      universalFlatFieldMetadata.objectMetadataUniversalIdentifier
    ];

  if (
    !isDefined(universalFlatObjectMetadata) ||
    !isFormulaFieldMetadata({ formula: writtenFormula })
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
  const { expression, currencyCodeExpression } = isDefined(
    getFieldMetadataFormulaExpression({ formula: writtenFormula }),
  )
    ? {
        expression: getFieldMetadataFormulaExpression({
          formula: writtenFormula,
        }),
        currencyCodeExpression: getFieldMetadataFormulaCurrencyCodeExpression({
          formula: writtenFormula,
        }),
      }
    : printFieldMetadataFormula({ formula: writtenFormula, fields });

  if (!isDefined(expression)) {
    return universalFlatFieldMetadata;
  }

  const compileToTree = (formulaExpression: string) => {
    const compilation = compileFormulaExpression({
      expression: formulaExpression,
      fields,
      evaluation: writtenFormula?.evaluation,
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
  const existingFormula =
    universalFlatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier]
      ?.formula;
  // Left out, the evaluation stays stored once stored, so formulas reading this one keep reading it
  const evaluation =
    writtenFormula?.evaluation ??
    (getFormulaEvaluationFromBindings({ bindings, fields }) === 'STORED' ||
    getFieldMetadataFormulaEvaluation({ formula: existingFormula }) === 'STORED'
      ? 'STORED'
      : 'QUERY_TIME');
  const formula: FieldMetadataFormula = {
    tree: compiledExpression.tree,
    ...(isDefined(compiledCurrencyCodeExpression)
      ? { currencyCodeTree: compiledCurrencyCodeExpression.tree }
      : {}),
    ...keepStoredFormulaEvaluation(evaluation),
  };

  return { ...universalFlatFieldMetadata, formula };
};
