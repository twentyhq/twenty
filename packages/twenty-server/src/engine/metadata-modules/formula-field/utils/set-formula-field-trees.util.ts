import {
  type FieldMetadataFormula,
  type ValidationRuleBindings,
} from 'twenty-shared/types';
import {
  compileFormulaExpression,
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
import { isFieldMetadataFormulaUnchanged } from 'src/engine/metadata-modules/formula-field/utils/is-field-metadata-formula-unchanged.util';
import { keepStoredFormulaEvaluation } from 'src/engine/metadata-modules/formula-field/utils/keep-stored-formula-evaluation.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// Text that does not compile is left as it is, for the validator to report
export const setFormulaFieldTrees = <
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

  const storedTree = getFieldMetadataFormulaTree({
    settings: existingUniversalSettings,
  });

  // TODO(@FelixMalfait): remove in 2.66, once 2-65 has stripped the text formulas kept from 2.64; until then that text is stale after a rename
  if (
    isDefined(storedTree) &&
    isFieldMetadataFormulaUnchanged({
      settings: universalSettings,
      existingSettings: existingUniversalSettings,
    })
  ) {
    const storedCurrencyCodeTree = getFieldMetadataFormulaTree({
      settings: existingUniversalSettings,
      isCurrencyCode: true,
    });

    return {
      ...universalFlatFieldMetadata,
      universalSettings: {
        ...universalSettings,
        formula: {
          tree: storedTree,
          ...(isDefined(storedCurrencyCodeTree)
            ? { currencyCodeTree: storedCurrencyCodeTree }
            : {}),
          ...keepStoredFormulaEvaluation(
            getFieldMetadataFormulaEvaluation({
              settings: existingUniversalSettings,
            }),
          ),
        },
      },
    };
  }

  if (!isDefined(universalFlatObjectMetadata)) {
    return universalFlatFieldMetadata;
  }

  const currencyCodeExpression = getFieldMetadataFormulaCurrencyCodeExpression({
    settings: universalSettings,
  });
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
