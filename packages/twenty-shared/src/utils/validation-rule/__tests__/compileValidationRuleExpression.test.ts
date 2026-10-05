import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { compileValidationRuleExpression } from '@/utils/validation-rule/compileValidationRuleExpression';

const COMPANY_FIELDS: ValidationRuleFieldDescriptor[] = [
  {
    name: 'industry',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'company-industry',
  },
  {
    name: 'people',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'company-people',
    relationType: RelationType.ONE_TO_MANY,
  },
];

const OPPORTUNITY_FIELDS: ValidationRuleFieldDescriptor[] = [
  {
    name: 'stage',
    type: FieldMetadataType.SELECT,
    universalIdentifier: 'opportunity-stage',
  },
  {
    name: 'amount',
    type: FieldMetadataType.CURRENCY,
    universalIdentifier: 'opportunity-amount',
  },
  {
    name: 'isQualified',
    type: FieldMetadataType.BOOLEAN,
    universalIdentifier: 'opportunity-is-qualified',
  },
  {
    name: 'tags',
    type: FieldMetadataType.MULTI_SELECT,
    universalIdentifier: 'opportunity-tags',
  },
  {
    name: 'company',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'opportunity-company',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: COMPANY_FIELDS,
  },
  {
    name: 'pointOfContacts',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'opportunity-point-of-contacts',
    relationType: RelationType.ONE_TO_MANY,
  },
];

const compile = (expression: string, bindings?: Record<string, string>) =>
  compileValidationRuleExpression({
    expression,
    fields: OPPORTUNITY_FIELDS,
    bindings,
  });

describe('compileValidationRuleExpression', () => {
  it('should replace every referenced field with a symbol bound to its universal identifier', () => {
    expect(
      compile('stage == "WON" and not isDefined(amount.amountMicros)'),
    ).toEqual({
      isValid: true,
      expression: '$f1 == "WON" and not isDefined($f2.amountMicros)',
      bindings: {
        $f1: 'opportunity-stage',
        $f2: 'opportunity-amount',
      },
    });
  });

  it('should bind a one-hop to-one relation path with one symbol per field', () => {
    expect(compile('company.industry == "SaaS"')).toEqual({
      isValid: true,
      expression: '$f1.$f2 == "SaaS"',
      bindings: {
        $f1: 'opportunity-company',
        $f2: 'company-industry',
      },
    });
  });

  it('should reuse the symbol of a field read several times', () => {
    expect(
      compile('stage == "WON" or (stage == "LOST" and isDefined(company))'),
    ).toEqual({
      isValid: true,
      expression: '$f1 == "WON" or ($f1 == "LOST" and isDefined($f2))',
      bindings: { $f1: 'opportunity-stage', $f2: 'opportunity-company' },
    });
  });

  it('should accept symbols resolved through the given bindings and number them again', () => {
    expect(
      compile('isDefined($f7) and $f3.$f9 == "SaaS"', {
        $f3: 'opportunity-company',
        $f7: 'opportunity-stage',
        $f9: 'company-industry',
      }),
    ).toEqual({
      isValid: true,
      expression: 'isDefined($f1) and $f2.$f3 == "SaaS"',
      bindings: {
        $f1: 'opportunity-stage',
        $f2: 'opportunity-company',
        $f3: 'company-industry',
      },
    });
  });

  it('should compile its own output to the same expression and bindings', () => {
    const firstCompilation = compile(
      'company.industry == "SaaS" or isEmpty(amount)',
    );

    if (!firstCompilation.isValid) {
      throw new Error(firstCompilation.errorMessage);
    }

    expect(
      compile(firstCompilation.expression, firstCompilation.bindings),
    ).toEqual(firstCompilation);
  });

  it('should reject a symbol that is not bound', () => {
    expect(compile('isDefined($f1)')).toEqual({
      isValid: false,
      errorMessage: '"$f1" is not bound to a field',
    });
  });

  it('should reject a symbol bound to a field that no longer exists', () => {
    expect(compile('isDefined($f1)', { $f1: 'deleted-field' })).toEqual({
      isValid: false,
      errorMessage: '"$f1" refers to a field that was deleted or deactivated',
    });
  });

  it('should reject member access that does not directly follow a field name', () => {
    expect(compile('(company).industry == "SaaS"')).toEqual({
      isValid: false,
      errorMessage:
        'Write each field path in one piece, without parentheses or spaces',
    });
  });

  it('should accept now as a value', () => {
    expect(compile('isDefined(now)')).toEqual({
      isValid: true,
      expression: 'isDefined(now)',
      bindings: {},
    });
  });

  it('should reject an unknown field', () => {
    expect(compile('closeDate > now')).toEqual({
      isValid: false,
      errorMessage: 'Unknown field "closeDate"',
    });
  });

  it('should reject an unknown composite subfield', () => {
    expect(compile('amount.value > 0')).toEqual({
      isValid: false,
      errorMessage: '"value" is not a subfield of "amount"',
    });
  });

  it('should reject a to-many relation path', () => {
    expect(compile('arrayLength(pointOfContacts) > 0')).toEqual({
      isValid: false,
      errorMessage: '"pointOfContacts" is not a to-one relation',
    });
  });

  it('should reject a path going two relations deep', () => {
    expect(compile('isDefined(company.people)')).toEqual({
      isValid: false,
      errorMessage: '"company.people" goes more than one relation deep',
    });
  });

  it('should reject functions that are not registered', () => {
    expect(compile('random() > 1')).toEqual({
      isValid: false,
      errorMessage: 'Unknown field "random"',
    });
  });

  it('should reject an expression that does not return true or false', () => {
    expect(compile('stage')).toEqual({
      isValid: false,
      errorMessage: 'Expression did not return true or false',
    });
    expect(compile('amount.amountMicros + 1').isValid).toBe(false);
  });

  it('should reject bracket access on fields and related records', () => {
    expect(compile('company["industry"] == "SaaS"')).toEqual({
      isValid: false,
      errorMessage: 'Bracket access is not supported, use dot access instead',
    });
    expect(
      compile('stage == "WON" and amount["amountMicros"] > 0').isValid,
    ).toBe(false);
  });

  it('should reject member access written with spaces around the dot', () => {
    expect(compile('company . industry == "SaaS"')).toEqual({
      isValid: false,
      errorMessage: 'Write company.industry without spaces around the dot',
    });
    expect(
      compile('company.industry == "SaaS" or company . industry == "B2B"')
        .isValid,
    ).toBe(false);
    expect(compile('company.industry == "SaaS"').isValid).toBe(true);
  });

  it('should reject the conditional operator, which can return a value that is not true or false', () => {
    expect(compile('isDefined(stage) ? stage : false').isValid).toBe(false);
    expect(compile('stage != "WON" or isDefined(amount)').isValid).toBe(true);
  });

  it('should accept a Boolean field on its own and still reject other fields on their own', () => {
    expect(compile('isQualified').isValid).toBe(true);
    expect(compile('stage').isValid).toBe(false);
  });

  it('should keep array literals', () => {
    expect(compile('stage in ["WON", "LOST"]').isValid).toBe(true);
  });

  it('should accept a value in a list field', () => {
    expect(compile('"PRIORITY" in tags')).toEqual({
      isValid: true,
      expression: '"PRIORITY" in $f1',
      bindings: { $f1: 'opportunity-tags' },
    });
  });

  it('should reject assignments', () => {
    expect(compile('stage = "WON"').isValid).toBe(false);
  });

  it('should reject a syntax error', () => {
    expect(compile('stage ==').isValid).toBe(false);
  });

  it('should reject an empty expression', () => {
    expect(compile('   ')).toEqual({
      isValid: false,
      errorMessage: 'Expression is empty',
    });
  });

  it('should reject an expression over the length cap', () => {
    expect(compile(`stage == "${'x'.repeat(2000)}"`).isValid).toBe(false);
  });
});
