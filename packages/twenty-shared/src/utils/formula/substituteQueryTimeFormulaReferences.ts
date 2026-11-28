import { type ExpressionNode } from '@/expression/types/ExpressionNode';
import { type FieldMetadataFormula } from '@/types/FieldMetadataFormula';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { mapExpressionFieldNodes } from '@/utils/expression/mapExpressionFieldNodes';
import { getFieldMetadataFormulaTree } from '@/utils/formula/getFieldMetadataFormulaTree';
import { isDefined } from '@/utils/validation/isDefined';

const CURRENCY_CODE_SUB_FIELD_NAME = 'currencyCode';

// Read through the relation; a path that would then cross a second relation names no field, so it reports as unknown
const readThroughRelation = ({
  node,
  relationFieldUniversalIdentifier,
}: {
  node: ExpressionNode;
  relationFieldUniversalIdentifier: string;
}): ExpressionNode =>
  mapExpressionFieldNodes({
    node,
    mapFieldNode: (fieldNode) => ({
      ...fieldNode,
      relationFieldUniversalIdentifier,
    }),
  });

const substituteNode = ({
  node,
  fields,
  substitutedUniversalIdentifiers,
}: {
  node: ExpressionNode;
  fields: ValidationRuleFieldDescriptor[];
  substitutedUniversalIdentifiers: Set<string>;
}): ExpressionNode =>
  mapExpressionFieldNodes({
    node,
    mapFieldNode: (fieldNode) => {
      const relationField = isDefined(
        fieldNode.relationFieldUniversalIdentifier,
      )
        ? fields.find(
            ({ universalIdentifier }) =>
              universalIdentifier ===
              fieldNode.relationFieldUniversalIdentifier,
          )
        : undefined;
      const readFields = isDefined(fieldNode.relationFieldUniversalIdentifier)
        ? (relationField?.relationTargetFields ?? [])
        : fields;
      const readField = readFields.find(
        ({ universalIdentifier }) =>
          universalIdentifier === fieldNode.fieldUniversalIdentifier,
      );
      const readFormulaTree = getFieldMetadataFormulaTree({
        formula: readField?.queryTimeFormula,
        isCurrencyCode: fieldNode.subFieldName === CURRENCY_CODE_SUB_FIELD_NAME,
      });

      if (
        !isDefined(readField) ||
        !isDefined(readFormulaTree) ||
        fieldNode.isPreviousValue === true ||
        substitutedUniversalIdentifiers.has(readField.universalIdentifier)
      ) {
        return fieldNode;
      }

      const substitutedTree = substituteNode({
        node: readFormulaTree,
        fields: readFields,
        substitutedUniversalIdentifiers: new Set([
          ...substitutedUniversalIdentifiers,
          readField.universalIdentifier,
        ]),
      });

      return isDefined(relationField)
        ? readThroughRelation({
            node: substitutedTree,
            relationFieldUniversalIdentifier: relationField.universalIdentifier,
          })
        : substitutedTree;
    },
  });

// A query-time formula has no stored value, so a formula reading it reads its expression instead
export const substituteQueryTimeFormulaReferences = <
  TFormula extends Partial<
    Pick<FieldMetadataFormula, 'tree' | 'currencyCodeTree'>
  >,
>({
  formula,
  fields,
}: {
  formula: TFormula;
  fields: ValidationRuleFieldDescriptor[];
}): TFormula => {
  const substitute = (isCurrencyCode: boolean) => {
    const tree = getFieldMetadataFormulaTree({ formula, isCurrencyCode });

    return isDefined(tree)
      ? substituteNode({
          node: tree,
          fields,
          substitutedUniversalIdentifiers: new Set(),
        })
      : undefined;
  };
  const tree = substitute(false);
  const currencyCodeTree = substitute(true);

  return {
    ...formula,
    ...(isDefined(tree) ? { tree } : {}),
    ...(isDefined(currencyCodeTree) ? { currencyCodeTree } : {}),
  };
};
