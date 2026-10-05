import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { compileValidationRuleExpression } from '@/utils/validation-rule/compileValidationRuleExpression';
import { renderValidationRuleExpression } from '@/utils/validation-rule/renderValidationRuleExpression';

const buildFields = ({
  amountName,
  companyName,
  industryName,
}: {
  amountName: string;
  companyName: string;
  industryName: string;
}): ValidationRuleFieldDescriptor[] => [
  {
    name: amountName,
    type: FieldMetadataType.CURRENCY,
    universalIdentifier: 'opportunity-amount',
  },
  {
    name: companyName,
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'opportunity-company',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: [
      {
        name: industryName,
        type: FieldMetadataType.TEXT,
        universalIdentifier: 'company-industry',
      },
    ],
  },
];

const FIELDS = buildFields({
  amountName: 'amount',
  companyName: 'company',
  industryName: 'industry',
});

const RENAMED_FIELDS = buildFields({
  amountName: 'dealValue',
  companyName: 'account',
  industryName: 'sector',
});

const SOURCE_EXPRESSION =
  'company.industry != "SaaS" or not isEmpty(amount.amountMicros)';

const compileOrThrow = (
  expression: string,
  fields: ValidationRuleFieldDescriptor[],
) => {
  const compilation = compileValidationRuleExpression({ expression, fields });

  if (!compilation.isValid) {
    throw new Error(compilation.errorMessage);
  }

  return compilation;
};

describe('renderValidationRuleExpression', () => {
  it('should render every symbol with the current field name', () => {
    const { expression, bindings } = compileOrThrow(SOURCE_EXPRESSION, FIELDS);

    expect(expression).toBe(
      '$f1.$f2 != "SaaS" or not isEmpty($f3.amountMicros)',
    );
    expect(
      renderValidationRuleExpression({ expression, bindings, fields: FIELDS }),
    ).toBe(SOURCE_EXPRESSION);
  });

  it('should render root and related field renames without changing the compiled expression', () => {
    const compilation = compileOrThrow(SOURCE_EXPRESSION, FIELDS);

    const renderedAfterRename = renderValidationRuleExpression({
      expression: compilation.expression,
      bindings: compilation.bindings,
      fields: RENAMED_FIELDS,
    });

    expect(renderedAfterRename).toBe(
      'account.sector != "SaaS" or not isEmpty(dealValue.amountMicros)',
    );
    expect(compileOrThrow(renderedAfterRename, RENAMED_FIELDS)).toEqual(
      compilation,
    );
  });

  it('should keep a symbol whose field no longer exists as written', () => {
    expect(
      renderValidationRuleExpression({
        expression: 'isDefined($f1) and $f2.$f3 == "SaaS"',
        bindings: {
          $f1: 'deleted-field',
          $f2: 'opportunity-company',
          $f3: 'deleted-related-field',
        },
        fields: FIELDS,
      }),
    ).toBe('isDefined($f1) and company.$f3 == "SaaS"');
  });

  it('should keep field names, functions and now as written', () => {
    expect(
      renderValidationRuleExpression({
        expression: 'isDefined(amount) and now > "2026-01-01"',
        bindings: {},
        fields: FIELDS,
      }),
    ).toBe('isDefined(amount) and now > "2026-01-01"');
  });
});
