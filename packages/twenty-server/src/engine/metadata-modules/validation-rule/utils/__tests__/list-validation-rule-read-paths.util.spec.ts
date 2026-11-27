/* @license Enterprise */

import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import {
  parseExpressionNode,
  resolveExpressionFieldReferences,
} from 'twenty-shared/utils';

import { listValidationRuleReadPaths } from 'src/engine/metadata-modules/validation-rule/utils/list-validation-rule-read-paths.util';

const FIELDS = [
  {
    name: 'amount',
    type: FieldMetadataType.CURRENCY,
    universalIdentifier: 'amount-universal-identifier',
  },
  {
    name: 'stage',
    type: FieldMetadataType.SELECT,
    universalIdentifier: 'stage-universal-identifier',
  },
  {
    name: 'company',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'company-universal-identifier',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: [
      {
        name: 'employees',
        type: FieldMetadataType.NUMBER,
        universalIdentifier: 'employees-universal-identifier',
      },
    ],
  },
];

const toTree = (expression: string) => {
  const parsing = parseExpressionNode(expression);

  if (!parsing.isValid) {
    throw new Error(parsing.errorMessage);
  }

  return resolveExpressionFieldReferences({
    node: parsing.node,
    fields: FIELDS,
  });
};

describe('listValidationRuleReadPaths', () => {
  it('should list each read field once, with the relation a related field is read through', () => {
    expect(
      listValidationRuleReadPaths({
        validationRules: [
          {
            tree: toTree('amount.amountMicros > 0 and company.employees > 10'),
          },
          { tree: toTree('stage == previous.stage or isDefined(company)') },
          { tree: null },
        ],
        fields: FIELDS,
      }),
    ).toEqual([
      'amount',
      'company',
      'company.employees',
      'stage',
      'previous.stage',
    ]);
  });
});
