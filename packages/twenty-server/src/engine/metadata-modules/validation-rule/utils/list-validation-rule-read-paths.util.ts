/* @license Enterprise */

import {
  type StoredExpressionTree,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import {
  buildExpressionFieldPrinter,
  isDefined,
  listValidationRuleFieldNodes,
} from 'twenty-shared/utils';

// Paths as the evaluator reads them: reading through a relation also reads the relation
export const listValidationRuleReadPaths = ({
  validationRules,
  fields,
}: {
  validationRules: { tree: StoredExpressionTree | null }[];
  fields: ValidationRuleFieldDescriptor[];
}): string[] => {
  const printField = buildExpressionFieldPrinter({ fields });

  return [
    ...new Set(
      validationRules.flatMap(({ tree }) =>
        listValidationRuleFieldNodes({ tree }).flatMap((fieldNode) => [
          ...(isDefined(fieldNode.relationFieldUniversalIdentifier)
            ? [
                printField({
                  type: 'FIELD',
                  fieldUniversalIdentifier:
                    fieldNode.relationFieldUniversalIdentifier,
                }),
              ]
            : []),
          printField({ ...fieldNode, subFieldName: undefined }),
        ]),
      ),
    ),
  ];
};
