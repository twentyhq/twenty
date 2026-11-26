import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { buildExpressionFieldPrinter } from '@/utils/expression/buildExpressionFieldPrinter';
import { parseExpressionNode } from '@/utils/expression/parseExpressionNode';
import { printExpressionNode } from '@/expression/utils/printExpressionNode';
import { resolveExpressionFieldReferences } from '@/utils/expression/resolveExpressionFieldReferences';

const FIELDS: ValidationRuleFieldDescriptor[] = [
  {
    name: 'price',
    type: FieldMetadataType.NUMBER,
    universalIdentifier: 'price-uid',
  },
  {
    name: 'amount',
    type: FieldMetadataType.CURRENCY,
    universalIdentifier: 'amount-uid',
  },
  {
    name: 'company',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'company-uid',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: [
      {
        name: 'name',
        type: FieldMetadataType.TEXT,
        universalIdentifier: 'company-name-uid',
      },
    ],
  },
];

const resolve = (expression: string, fields = FIELDS) => {
  const parsing = parseExpressionNode(expression);

  if (!parsing.isValid) {
    throw new Error(parsing.errorMessage);
  }

  return resolveExpressionFieldReferences({ node: parsing.node, fields });
};

const print = (expression: string, fields: ValidationRuleFieldDescriptor[]) =>
  printExpressionNode({
    node: resolve(expression),
    printField: buildExpressionFieldPrinter({ fields }),
  });

describe('resolveExpressionFieldReferences', () => {
  it('should read fields, sub-fields, lookups and previous values by identifier', () => {
    expect(
      resolve(
        'price + amount.amountMicros + previous.price > 0 and company.name != "" and isDefined(company) and now > now',
      ),
    ).toEqual({
      type: 'GROUP',
      logicalOperator: 'AND',
      children: [
        {
          type: 'COMPARISON',
          operator: 'GREATER_THAN',
          left: {
            type: 'ARITHMETIC',
            operator: 'ADD',
            left: {
              type: 'ARITHMETIC',
              operator: 'ADD',
              left: { type: 'FIELD', fieldUniversalIdentifier: 'price-uid' },
              right: {
                type: 'FIELD',
                fieldUniversalIdentifier: 'amount-uid',
                subFieldName: 'amountMicros',
              },
            },
            right: {
              type: 'FIELD',
              fieldUniversalIdentifier: 'price-uid',
              isPreviousValue: true,
            },
          },
          right: { type: 'LITERAL', value: 0 },
        },
        {
          type: 'COMPARISON',
          operator: 'NOT_EQUAL',
          left: {
            type: 'FIELD',
            relationFieldUniversalIdentifier: 'company-uid',
            fieldUniversalIdentifier: 'company-name-uid',
          },
          right: { type: 'LITERAL', value: '' },
        },
        {
          type: 'FUNCTION_CALL',
          functionName: 'isDefined',
          arguments: [
            { type: 'FIELD', fieldUniversalIdentifier: 'company-uid' },
          ],
        },
        {
          type: 'COMPARISON',
          operator: 'GREATER_THAN',
          left: { type: 'VARIABLE', path: 'now' },
          right: { type: 'VARIABLE', path: 'now' },
        },
      ],
    });
  });

  it('should keep a path naming no field as written', () => {
    expect(resolve('missing * 2')).toEqual({
      type: 'ARITHMETIC',
      operator: 'MULTIPLY',
      left: { type: 'VARIABLE', path: 'missing' },
      right: { type: 'LITERAL', value: 2 },
    });
  });

  it('should print a resolved expression back as written', () => {
    const expression =
      'price + amount.amountMicros + previous.price > 0 and company.name != ""';

    expect(print(expression, FIELDS)).toBe(expression);
  });

  it('should print the current name of a renamed field', () => {
    const renamedFields = FIELDS.map((field) =>
      field.name === 'price' ? { ...field, name: 'unitPrice' } : field,
    );

    expect(print('price * 2', renamedFields)).toBe('unitPrice * 2');
  });

  it('should print a missing field so that it reads as unknown', () => {
    expect(print('price * 2', [])).toBe('missingField_price_uid * 2');
  });
});
