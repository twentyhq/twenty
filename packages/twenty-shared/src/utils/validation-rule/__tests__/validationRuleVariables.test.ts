import { FieldMetadataType } from '@/types/FieldMetadataType';
import { compileValidationRuleExpression } from '@/utils/validation-rule/compileValidationRuleExpression';
import { createValidationRuleEvaluator } from '@/utils/validation-rule/createValidationRuleEvaluator';

const NOW = '2026-11-11T10:00:00.000Z';

const FIELDS = [
  {
    name: 'employees',
    type: FieldMetadataType.NUMBER,
    universalIdentifier: 'company-employees',
  },
];

const VARIABLE_CONTEXT = {
  trigger: { properties: { after: { name: 'Acme', employees: 50 } } },
  'step-1': {
    amount: 1200,
    status: 'WON',
    tags: ['VIP', 'NEW'],
    closeDate: '2026-11-11',
    owner: null,
  },
};

const compileWithVariables = (expression: string) =>
  compileValidationRuleExpression({
    expression,
    fields: FIELDS,
    allowsVariables: true,
  });

const evaluateWithVariables = (
  expression: string,
  variableContext: Record<string, unknown> = VARIABLE_CONTEXT,
) =>
  createValidationRuleEvaluator({
    expression,
    fields: FIELDS,
    allowsVariables: true,
  })({ record: {}, now: NOW, variableContext }).status;

describe('workflow variables in rule expressions', () => {
  it('should compile variables only when the caller allows them', () => {
    expect(compileWithVariables('{{step-1.amount}} > 1000')).toEqual({
      isValid: true,
      bindings: {},
    });
    expect(
      compileValidationRuleExpression({
        expression: '{{step-1.amount}} > 1000',
        fields: FIELDS,
      }),
    ).toMatchObject({ isValid: false, errorCode: 'INVALID_SYNTAX' });
  });

  it('should compile variables next to fields and keep the field bindings', () => {
    expect(
      compileWithVariables(
        'employees > {{trigger.properties.after.employees}} and includes({{step-1.tags}}, "VIP")',
      ),
    ).toEqual({
      isValid: true,
      bindings: { employees: 'company-employees' },
    });
  });

  it('should ask for the whole path inside the braces', () => {
    expect(compileWithVariables('{{ step-1 }}.amount > 10')).toMatchObject({
      isValid: false,
      errorCode: 'VARIABLE_MEMBER_ACCESS',
      errorParams: { path: '{{step-1.amount}}' },
    });
  });

  it('should not read an identifier typed like a replaced variable', () => {
    expect(
      compileWithVariables('{{step-1.amount}} > $variable0'),
    ).toMatchObject({ isValid: false, errorCode: 'UNKNOWN_FIELD' });
  });

  it('should read variables from the context it is given', () => {
    expect(
      evaluateWithVariables(
        '{{step-1.amount}} > 1000 and {{ step-1.status }} == "WON"',
      ),
    ).toBe('passed');
    expect(
      evaluateWithVariables('{{trigger.properties.after.name}} == "Other"'),
    ).toBe('failed');
    expect(evaluateWithVariables('includes({{step-1.tags}}, "VIP")')).toBe(
      'passed',
    );
    expect(evaluateWithVariables('{{step-1.closeDate}} == "2026-11-11"')).toBe(
      'passed',
    );
  });

  it('should read a missing or null variable as an empty value', () => {
    expect(evaluateWithVariables('isEmpty({{step-1.owner}})')).toBe('passed');
    expect(evaluateWithVariables('isDefined({{step-2.anything}})')).toBe(
      'failed',
    );
    expect(evaluateWithVariables('{{step-2.amount}} > 0')).toBe('failed');
    expect(evaluateWithVariables('{{step-1.amount}} > 0', {})).toBe('failed');
  });

  it('should error when a variable alone is not true or false', () => {
    expect(evaluateWithVariables('{{step-1.amount}}')).toBe('errored');
  });

  it('should read the same variable once however often it appears', () => {
    expect(
      evaluateWithVariables(
        '{{step-1.amount}} >= 1200 and {{step-1.amount}} <= 1200',
      ),
    ).toBe('passed');
  });
});
