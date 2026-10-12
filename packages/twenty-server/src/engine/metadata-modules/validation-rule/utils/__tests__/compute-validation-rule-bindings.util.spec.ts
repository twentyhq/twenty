/* @license Enterprise */

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { compileValidationRuleExpressionOrThrow } from 'src/engine/metadata-modules/validation-rule/utils/compile-validation-rule-expression-or-throw.util';
import { computeValidationRuleBindings } from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rule-bindings.util';

jest.mock(
  'src/engine/metadata-modules/validation-rule/utils/compile-validation-rule-expression-or-throw.util',
  () => ({
    compileValidationRuleExpressionOrThrow: jest.fn(() => ({
      amount: 'compiled-amount-field-id',
    })),
  }),
);

const COMPILE_INPUT = {
  objectMetadataId: 'object-metadata-id',
  flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
  flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
};

const EXISTING_BINDINGS = { amount: 'existing-amount-field-id' };

const COMPILED_BINDINGS = { amount: 'compiled-amount-field-id' };

describe('computeValidationRuleBindings', () => {
  beforeEach(() => {
    jest.mocked(compileValidationRuleExpressionOrThrow).mockClear();
  });

  it('should compile a new active rule', () => {
    expect(
      computeValidationRuleBindings({
        ...COMPILE_INPUT,
        expression: 'amount > 0',
        isActive: true,
      }),
    ).toEqual(COMPILED_BINDINGS);
    expect(compileValidationRuleExpressionOrThrow).toHaveBeenCalledTimes(1);
    expect(compileValidationRuleExpressionOrThrow).toHaveBeenCalledWith({
      ...COMPILE_INPUT,
      expression: 'amount > 0',
    });
  });

  it('should leave a new inactive rule without bindings', () => {
    expect(
      computeValidationRuleBindings({
        ...COMPILE_INPUT,
        expression: '',
        isActive: false,
      }),
    ).toEqual({});
    expect(compileValidationRuleExpressionOrThrow).not.toHaveBeenCalled();
  });

  it('should compile when an active rule gets a new expression', () => {
    expect(
      computeValidationRuleBindings({
        ...COMPILE_INPUT,
        expression: 'amount > 10',
        isActive: true,
        existingFlatValidationRule: {
          expression: 'amount > 0',
          isActive: true,
          bindings: EXISTING_BINDINGS,
        },
      }),
    ).toEqual(COMPILED_BINDINGS);
    expect(compileValidationRuleExpressionOrThrow).toHaveBeenCalledTimes(1);
    expect(compileValidationRuleExpressionOrThrow).toHaveBeenCalledWith({
      ...COMPILE_INPUT,
      expression: 'amount > 10',
    });
  });

  it('should compile when an inactive rule is activated', () => {
    expect(
      computeValidationRuleBindings({
        ...COMPILE_INPUT,
        expression: 'amount > 0',
        isActive: true,
        existingFlatValidationRule: {
          expression: 'amount > 0',
          isActive: false,
          bindings: {},
        },
      }),
    ).toEqual(COMPILED_BINDINGS);
    expect(compileValidationRuleExpressionOrThrow).toHaveBeenCalledTimes(1);
    expect(compileValidationRuleExpressionOrThrow).toHaveBeenCalledWith({
      ...COMPILE_INPUT,
      expression: 'amount > 0',
    });
  });

  it('should keep the bindings when the expression does not change', () => {
    expect(
      computeValidationRuleBindings({
        ...COMPILE_INPUT,
        expression: 'amount > 0',
        isActive: true,
        existingFlatValidationRule: {
          expression: 'amount > 0',
          isActive: true,
          bindings: EXISTING_BINDINGS,
        },
      }),
    ).toEqual(EXISTING_BINDINGS);
    expect(compileValidationRuleExpressionOrThrow).not.toHaveBeenCalled();
  });

  it('should clear the bindings when an inactive rule gets a new expression', () => {
    expect(
      computeValidationRuleBindings({
        ...COMPILE_INPUT,
        expression: 'amount >',
        isActive: false,
        existingFlatValidationRule: {
          expression: 'amount > 0',
          isActive: false,
          bindings: EXISTING_BINDINGS,
        },
      }),
    ).toEqual({});
    expect(compileValidationRuleExpressionOrThrow).not.toHaveBeenCalled();
  });
});
