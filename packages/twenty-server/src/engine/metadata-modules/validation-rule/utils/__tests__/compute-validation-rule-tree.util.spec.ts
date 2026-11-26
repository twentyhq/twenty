/* @license Enterprise */

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { compileValidationRuleTreeOrThrow } from 'src/engine/metadata-modules/validation-rule/utils/compile-validation-rule-tree-or-throw.util';
import { computeValidationRuleTree } from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rule-tree.util';

const COMPILED_TREE = {
  type: 'FIELD',
  fieldUniversalIdentifier: 'compiled-amount-field-id',
};

const EXISTING_TREE = {
  type: 'FIELD',
  fieldUniversalIdentifier: 'existing-amount-field-id',
};

jest.mock(
  'src/engine/metadata-modules/validation-rule/utils/compile-validation-rule-tree-or-throw.util',
  () => ({
    compileValidationRuleTreeOrThrow: jest.fn(() => COMPILED_TREE),
  }),
);

jest.mock(
  'src/engine/metadata-modules/validation-rule/utils/print-flat-validation-rule-expression.util',
  () => ({
    printFlatValidationRuleExpression: jest.fn(() => 'amount > 0'),
  }),
);

const COMPILE_INPUT = {
  objectMetadataId: 'object-metadata-id',
  flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
  flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
};

describe('computeValidationRuleTree', () => {
  beforeEach(() => {
    jest.mocked(compileValidationRuleTreeOrThrow).mockClear();
  });

  it('should compile a new rule', () => {
    expect(
      computeValidationRuleTree({
        ...COMPILE_INPUT,
        expression: 'amount > 0',
        isActive: true,
      }),
    ).toEqual(COMPILED_TREE);
    expect(compileValidationRuleTreeOrThrow).toHaveBeenCalledWith({
      ...COMPILE_INPUT,
      expression: 'amount > 0',
      isActive: true,
    });
  });

  it('should leave a new inactive rule without an expression without a tree', () => {
    expect(
      computeValidationRuleTree({
        ...COMPILE_INPUT,
        expression: ' ',
        isActive: false,
      }),
    ).toBeNull();
    expect(compileValidationRuleTreeOrThrow).not.toHaveBeenCalled();
  });

  it.each([
    ['an active rule gets a new expression', 'amount > 10', true, true],
    ['an inactive rule gets a new expression', 'amount > 10', false, false],
    ['an inactive rule is activated', undefined, false, true],
  ])('should compile when %s', (_, expression, wasActive, isActive) => {
    expect(
      computeValidationRuleTree({
        ...COMPILE_INPUT,
        expression,
        isActive,
        existingFlatValidationRule: {
          tree: EXISTING_TREE,
          isActive: wasActive,
        },
      }),
    ).toEqual(COMPILED_TREE);
    expect(compileValidationRuleTreeOrThrow).toHaveBeenCalledWith({
      ...COMPILE_INPUT,
      expression: expression ?? 'amount > 0',
      isActive,
    });
  });

  it.each([
    ['is not sent', undefined],
    ['is sent back as printed', 'amount > 0'],
  ])('should keep the tree when the expression %s', (_, expression) => {
    expect(
      computeValidationRuleTree({
        ...COMPILE_INPUT,
        expression,
        isActive: true,
        existingFlatValidationRule: { tree: EXISTING_TREE, isActive: true },
      }),
    ).toBe(EXISTING_TREE);
    expect(compileValidationRuleTreeOrThrow).not.toHaveBeenCalled();
  });

  it('should clear the tree when an inactive rule gets an empty expression', () => {
    expect(
      computeValidationRuleTree({
        ...COMPILE_INPUT,
        expression: '',
        isActive: false,
        existingFlatValidationRule: { tree: EXISTING_TREE, isActive: false },
      }),
    ).toBeNull();
    expect(compileValidationRuleTreeOrThrow).not.toHaveBeenCalled();
  });
});
