import { printExpressionNode } from '@/expression/utils/printExpressionNode';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { buildExpressionFieldPrinter } from '@/utils/expression/buildExpressionFieldPrinter';
import { parseExpressionNode } from '@/utils/expression/parseExpressionNode';
import { resolveExpressionFieldReferences } from '@/utils/expression/resolveExpressionFieldReferences';
import { getFieldMetadataFormulaTree } from '@/utils/formula/getFieldMetadataFormulaTree';
import { substituteQueryTimeFormulaReferences } from '@/utils/formula/substituteQueryTimeFormulaReferences';

const toTree = (
  expression: string,
  fields: ValidationRuleFieldDescriptor[],
) => {
  const parsing = parseExpressionNode(expression);

  if (!parsing.isValid) {
    throw new Error(parsing.errorMessage);
  }

  return resolveExpressionFieldReferences({ node: parsing.node, fields });
};

const REGION_FIELDS: ValidationRuleFieldDescriptor[] = [
  { name: 'rate', type: FieldMetadataType.NUMBER, universalIdentifier: 'rate' },
  {
    name: 'country',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'country',
    relationType: RelationType.MANY_TO_ONE,
  },
];

const REGION_QUERY_TIME_FIELDS: ValidationRuleFieldDescriptor[] = [
  ...REGION_FIELDS,
  {
    name: 'doubleRate',
    type: FieldMetadataType.NUMBER,
    universalIdentifier: 'doubleRate',
    queryTimeFormula: { tree: toTree('rate * 2', REGION_FIELDS) },
  },
  {
    name: 'countryRate',
    type: FieldMetadataType.NUMBER,
    universalIdentifier: 'countryRate',
    queryTimeFormula: {
      tree: {
        type: 'FIELD',
        relationFieldUniversalIdentifier: 'country',
        fieldUniversalIdentifier: 'countryTax',
      },
    },
  },
];

const OWN_FIELDS: ValidationRuleFieldDescriptor[] = [
  {
    name: 'amount',
    type: FieldMetadataType.NUMBER,
    universalIdentifier: 'amount',
  },
  {
    name: 'stored',
    type: FieldMetadataType.NUMBER,
    universalIdentifier: 'stored',
  },
  {
    name: 'region',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'region',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: REGION_QUERY_TIME_FIELDS,
  },
];

const NET_FIELD: ValidationRuleFieldDescriptor = {
  name: 'net',
  type: FieldMetadataType.NUMBER,
  universalIdentifier: 'net',
  queryTimeFormula: { tree: toTree('amount - 1', OWN_FIELDS) },
};

const FIELDS: ValidationRuleFieldDescriptor[] = [
  ...OWN_FIELDS,
  NET_FIELD,
  {
    name: 'netPlusStored',
    type: FieldMetadataType.NUMBER,
    universalIdentifier: 'netPlusStored',
    queryTimeFormula: {
      tree: toTree('net + stored', [...OWN_FIELDS, NET_FIELD]),
    },
  },
];

const substitute = (expression: string) =>
  printExpressionNode({
    node: getFieldMetadataFormulaTree({
      formula: substituteQueryTimeFormulaReferences({
        formula: { tree: toTree(expression, FIELDS) },
        fields: FIELDS,
      }),
    })!,
    printField: buildExpressionFieldPrinter({ fields: FIELDS }),
  });

describe('substituteQueryTimeFormulaReferences', () => {
  it('should read a query-time formula as its expression and a stored field as itself', () => {
    expect(substitute('net * 2 + stored')).toBe('(amount - 1) * 2 + stored');
  });

  it('should substitute the formulas a query-time formula reads', () => {
    expect(substitute('netPlusStored')).toBe('amount - 1 + stored');
  });

  it('should read a looked-up query-time formula through the relation', () => {
    expect(substitute('region.doubleRate + region.rate')).toBe(
      'region.rate * 2 + region.rate',
    );
  });

  it('should report a looked-up formula that crosses a second relation as unknown', () => {
    expect(substitute('region.countryRate')).toBe(
      'region.missingField_countryTax',
    );
  });

  it('should keep the formula as it is when it reads no query-time formula', () => {
    const formula = { tree: toTree('amount + region.rate', FIELDS) };

    expect(
      substituteQueryTimeFormulaReferences({ formula, fields: FIELDS }),
    ).toEqual(formula);
  });
});
