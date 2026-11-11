import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import {
  type StepFilterGroup,
  StepLogicalOperator,
  type StepFilterWithPotentiallyDeprecatedOperand,
} from '@/types/StepFilters';
import { type ValidationRuleDatabaseEventAction } from '@/types/ValidationRuleDatabaseEventAction';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';
import { ViewFilterOperandDeprecated } from '@/types/ViewFilterOperandDeprecated';
import { compileValidationRuleExpression } from '@/utils/validation-rule/compileValidationRuleExpression';
import { convertStepFiltersToRuleExpression } from '@/workflow/utils/convertStepFiltersToRuleExpression';

const ROOT_GROUP: StepFilterGroup = {
  id: 'root',
  logicalOperator: StepLogicalOperator.AND,
};

const FIELDS = [
  { name: 'name', type: FieldMetadataType.TEXT, universalIdentifier: 'name' },
  {
    name: 'stage',
    type: FieldMetadataType.SELECT,
    universalIdentifier: 'stage',
  },
  {
    name: 'tags',
    type: FieldMetadataType.MULTI_SELECT,
    universalIdentifier: 'tags',
  },
  {
    name: 'employees',
    type: FieldMetadataType.NUMBER,
    universalIdentifier: 'employees',
  },
  {
    name: 'amount',
    type: FieldMetadataType.CURRENCY,
    universalIdentifier: 'amount',
  },
  {
    name: 'closeDate',
    type: FieldMetadataType.DATE,
    universalIdentifier: 'closeDate',
  },
  {
    name: 'isActive',
    type: FieldMetadataType.BOOLEAN,
    universalIdentifier: 'isActive',
  },
  {
    name: 'company',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'company',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: [
      { name: 'id', type: FieldMetadataType.UUID, universalIdentifier: 'id' },
    ],
  },
];

const buildStepFilter = (
  stepFilter: Partial<StepFilterWithPotentiallyDeprecatedOperand> &
    Pick<
      StepFilterWithPotentiallyDeprecatedOperand,
      'type' | 'operand' | 'stepOutputKey'
    >,
): StepFilterWithPotentiallyDeprecatedOperand => ({
  id: 'filter',
  value: '',
  stepFilterGroupId: ROOT_GROUP.id,
  ...stepFilter,
});

const convert = (
  stepFilter: Parameters<typeof buildStepFilter>[0],
  databaseEventAction: ValidationRuleDatabaseEventAction = 'updated',
) =>
  convertStepFiltersToRuleExpression({
    stepFilterGroups: [ROOT_GROUP],
    stepFilters: [buildStepFilter(stepFilter)],
    databaseEventAction,
  });

const after = (path: string) => `{{trigger.properties.after.${path}}}`;

const before = (path: string) => `{{trigger.properties.before.${path}}}`;

describe('convertStepFiltersToRuleExpression', () => {
  describe('paths', () => {
    it('should read after as the record and before as previous', () => {
      expect(
        convert({
          type: 'TEXT',
          operand: ViewFilterOperand.IS,
          stepOutputKey: before('name'),
          value: 'Acme',
        }),
      ).toEqual({ isConvertible: true, expression: "previous.name == 'Acme'" });
    });

    it('should read before as the record of a deleted record', () => {
      expect(
        convert(
          {
            type: 'TEXT',
            operand: ViewFilterOperand.IS,
            stepOutputKey: before('name'),
            value: 'Acme',
          },
          'deleted',
        ),
      ).toEqual({ isConvertible: true, expression: "name == 'Acme'" });

      expect(
        convert(
          {
            type: 'TEXT',
            operand: ViewFilterOperand.IS,
            stepOutputKey: after('name'),
            value: 'Acme',
          },
          'destroyed',
        ).isConvertible,
      ).toBe(false);
    });

    it.each([
      '{{trigger.objectMetadata.nameSingular}}',
      '{{trigger.properties.updatedFields}}',
      '{{step-1.name}}',
      'Name: {{trigger.properties.after.name}}',
      '{{trigger.properties.after.now}}',
      '{{trigger.properties.after.name.true}}',
      '{{trigger.properties.after}}',
    ])('should not convert the output key %s', (stepOutputKey) => {
      expect(
        convert({
          type: 'TEXT',
          operand: ViewFilterOperand.IS_EMPTY,
          stepOutputKey,
        }).isConvertible,
      ).toBe(false);
    });

    it('should accept deprecated operands', () => {
      expect(
        convert({
          type: 'NUMBER',
          operand: ViewFilterOperandDeprecated.GreaterThanOrEqual,
          stepOutputKey: after('employees'),
          value: '10',
        }),
      ).toEqual({ isConvertible: true, expression: 'employees >= 10' });
    });
  });

  describe('convertible filters', () => {
    it.each<[string, Parameters<typeof buildStepFilter>[0], string]>([
      [
        'text contains',
        {
          type: 'TEXT',
          operand: ViewFilterOperand.CONTAINS,
          stepOutputKey: after('name'),
          value: 'Acme',
        },
        "includes(name, 'Acme')",
      ],
      [
        'text contains any of a JSON list',
        {
          type: 'TEXT',
          operand: ViewFilterOperand.CONTAINS,
          stepOutputKey: after('name'),
          value: '["Acme","Corp"]',
        },
        "includes(name, 'Acme') or includes(name, 'Corp')",
      ],
      [
        'text contains an empty value',
        {
          type: 'TEXT',
          operand: ViewFilterOperand.CONTAINS,
          stepOutputKey: after('name'),
          value: '',
        },
        'true',
      ],
      [
        'text does not contain an empty value',
        {
          type: 'TEXT',
          operand: ViewFilterOperand.DOES_NOT_CONTAIN,
          stepOutputKey: after('name'),
          value: '',
        },
        'not isEmpty(name)',
      ],
      [
        'text contains a letter of "null" and "undefined"',
        {
          type: 'TEXT',
          operand: ViewFilterOperand.CONTAINS,
          stepOutputKey: after('name'),
          value: 'n',
        },
        "includes(name, 'n') or not isDefined(name)",
      ],
      [
        'text is not empty',
        {
          type: 'TEXT',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          stepOutputKey: after('name'),
        },
        'not isEmpty(name)',
      ],
      [
        'escaped text',
        {
          type: 'TEXT',
          operand: ViewFilterOperand.IS_NOT,
          stepOutputKey: after('name'),
          value: `O'Brien "\\`,
        },
        "name != 'O\\u0027Brien \\u0022\\u005c'",
      ],
      [
        'a composite text subfield',
        {
          type: 'EMAILS',
          operand: ViewFilterOperand.DOES_NOT_CONTAIN,
          stepOutputKey: after('emails.primaryEmail'),
          compositeFieldSubFieldName: 'primaryEmail',
          value: '@acme.com',
        },
        "not includes(emails.primaryEmail, '@acme.com')",
      ],
      [
        'a related record field',
        {
          type: 'TEXT',
          operand: ViewFilterOperand.IS,
          stepOutputKey: after('company.name'),
          value: 'Acme',
        },
        "company.name == 'Acme'",
      ],
      [
        'select is one of several options',
        {
          type: 'SELECT',
          operand: ViewFilterOperand.IS,
          stepOutputKey: after('stage'),
          value: '["NEW","WON"]',
        },
        "stage in ['NEW', 'WON']",
      ],
      [
        'select is not an option or empty',
        {
          type: 'SELECT',
          operand: ViewFilterOperand.IS_NOT,
          stepOutputKey: after('stage'),
          value: '["NEW",""]',
        },
        "not (stage == 'NEW' or not isDefined(stage))",
      ],
      [
        'multi-select contains any of',
        {
          type: 'MULTI_SELECT',
          operand: ViewFilterOperand.CONTAINS,
          stepOutputKey: after('tags'),
          value: '["VIP"]',
        },
        "includes(tags, 'VIP')",
      ],
      [
        'number is',
        {
          type: 'NUMBER',
          operand: ViewFilterOperand.IS,
          stepOutputKey: after('employees'),
          value: '-2.5',
        },
        'employees == -2.5',
      ],
      [
        'number is not a number',
        {
          type: 'NUMBER',
          operand: ViewFilterOperand.IS_NOT,
          stepOutputKey: after('employees'),
          value: 'abc',
        },
        'true',
      ],
      [
        'currency amount',
        {
          type: 'CURRENCY',
          operand: ViewFilterOperand.LESS_THAN_OR_EQUAL,
          stepOutputKey: after('amount.amountMicros'),
          compositeFieldSubFieldName: 'amountMicros',
          value: '1000000',
        },
        'amount.amountMicros <= 1000000',
      ],
      [
        'currency code',
        {
          type: 'CURRENCY',
          operand: ViewFilterOperand.IS,
          stepOutputKey: after('amount.currencyCode'),
          compositeFieldSubFieldName: 'currencyCode',
          value: '["USD","EUR"]',
        },
        "includes(amount.currencyCode, 'USD') or includes(amount.currencyCode, 'EUR')",
      ],
      [
        'rating at least',
        {
          type: 'RATING',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          stepOutputKey: after('rating'),
          value: 'RATING_4',
        },
        "rating in ['RATING_4', 'RATING_5']",
      ],
      [
        'boolean is true',
        {
          type: 'BOOLEAN',
          operand: ViewFilterOperand.IS,
          stepOutputKey: after('isActive'),
          value: 'true',
        },
        'isActive == true',
      ],
      [
        'relation record is',
        {
          type: 'RELATION',
          operand: ViewFilterOperand.IS,
          stepOutputKey: after('company'),
          isFullRecord: true,
          value: '20202020-0000-4000-8000-000000000001',
        },
        "company.id == '20202020-0000-4000-8000-000000000001'",
      ],
      [
        'actor workspace member is empty',
        {
          type: 'ACTOR',
          operand: ViewFilterOperand.IS_EMPTY,
          stepOutputKey: after('createdBy.workspaceMemberId'),
          compositeFieldSubFieldName: 'workspaceMemberId',
        },
        'isEmpty(createdBy.workspaceMemberId)',
      ],
      [
        'actor source',
        {
          type: 'ACTOR',
          operand: ViewFilterOperand.IS,
          stepOutputKey: after('createdBy.source'),
          compositeFieldSubFieldName: 'source',
          value: '["MANUAL","API"]',
        },
        "createdBy.source in ['MANUAL', 'API']",
      ],
      [
        'date is',
        {
          type: 'DATE',
          operand: ViewFilterOperand.IS,
          stepOutputKey: after('closeDate'),
          value: '2026-03-01',
        },
        "closeDate == '2026-03-01'",
      ],
      [
        'date-time is on a day',
        {
          type: 'DATE_TIME',
          operand: ViewFilterOperand.IS,
          stepOutputKey: after('createdAt'),
          value: '2026-03-01T22:00:00.000Z',
        },
        "createdAt >= '2026-03-01' and createdAt <= '2026-03-01'",
      ],
      [
        'date is before a date-time',
        {
          type: 'DATE',
          operand: ViewFilterOperand.IS_BEFORE,
          stepOutputKey: after('closeDate'),
          value: '2026-03-01T10:00:00Z',
        },
        "closeDate <= '2026-03-01'",
      ],
      [
        'date-time is before a date',
        {
          type: 'DATE_TIME',
          operand: ViewFilterOperand.IS_BEFORE,
          stepOutputKey: after('createdAt'),
          value: '2026-03-01',
        },
        "createdAt < '2026-03-01'",
      ],
      [
        'date-time is after',
        {
          type: 'DATE_TIME',
          operand: ViewFilterOperand.IS_AFTER,
          stepOutputKey: after('createdAt'),
          value: '2026-03-01',
        },
        "createdAt > '2026-03-01T00:00:00.000Z'",
      ],
      [
        'date-time is in the past',
        {
          type: 'DATE_TIME',
          operand: ViewFilterOperand.IS_IN_PAST,
          stepOutputKey: after('createdAt'),
        },
        'createdAt < now',
      ],
      [
        'date is today',
        {
          type: 'DATE',
          operand: ViewFilterOperand.IS_TODAY,
          stepOutputKey: after('closeDate'),
        },
        'daysSince(closeDate) == 0',
      ],
      [
        'date is relative',
        {
          type: 'DATE',
          operand: ViewFilterOperand.IS_RELATIVE,
          stepOutputKey: after('closeDate'),
          value: JSON.stringify({ direction: 'PAST', amount: 3, unit: 'DAY' }),
        },
        "isInRelativeDateRange(closeDate, 'PAST', 3, 'DAY')",
      ],
      [
        'date is relative to this week starting on Monday',
        {
          type: 'DATE',
          operand: ViewFilterOperand.IS_RELATIVE,
          stepOutputKey: after('closeDate'),
          value: JSON.stringify({
            direction: 'THIS',
            unit: 'WEEK',
            firstDayOfTheWeek: 'MONDAY',
          }),
        },
        "isInRelativeDateRange(closeDate, 'THIS', 1, 'WEEK')",
      ],
      [
        'field changed on update',
        {
          type: 'TEXT',
          operand: ViewFilterOperand.IS_NOT,
          stepOutputKey: after('name'),
          value: before('name'),
        },
        'name != previous.name and (isDefined(previous.name) or not isEmpty(name))',
      ],
      [
        'field kept on update',
        {
          type: 'NUMBER',
          operand: ViewFilterOperand.IS,
          stepOutputKey: before('employees'),
          value: after('employees'),
        },
        'previous.employees == employees or (not isDefined(employees) and isEmpty(previous.employees))',
      ],
    ])('should convert %s', (_, stepFilter, expression) => {
      expect(convert(stepFilter)).toEqual({ isConvertible: true, expression });
    });
  });

  describe('unconvertible filters', () => {
    it.each<[string, Parameters<typeof buildStepFilter>[0]]>([
      [
        'a boolean is false, which null does not match',
        {
          type: 'BOOLEAN',
          operand: ViewFilterOperand.IS,
          stepOutputKey: after('isActive'),
          value: 'false',
        },
      ],
      [
        'a contains value matched by "null" only',
        {
          type: 'TEXT',
          operand: ViewFilterOperand.CONTAINS,
          stepOutputKey: after('name'),
          value: 'ull',
        },
      ],
      [
        'a JSON list with numbers',
        {
          type: 'TEXT',
          operand: ViewFilterOperand.CONTAINS,
          stepOutputKey: after('name'),
          value: '[1, 2]',
        },
      ],
      [
        'raw JSON',
        {
          type: 'RAW_JSON',
          operand: ViewFilterOperand.IS_EMPTY,
          stepOutputKey: after('payload'),
        },
      ],
      [
        'an untyped variable',
        {
          type: 'number',
          operand: ViewFilterOperand.IS,
          stepOutputKey: after('employees'),
          value: '3',
        },
      ],
      [
        'a numeric equality',
        {
          type: 'NUMERIC',
          operand: ViewFilterOperand.IS,
          stepOutputKey: after('score'),
          value: '3',
        },
      ],
      [
        'a number with an exponent',
        {
          type: 'NUMBER',
          operand: ViewFilterOperand.IS,
          stepOutputKey: after('employees'),
          value: '1e21',
        },
      ],
      [
        'an unsupported operand',
        {
          type: 'TEXT',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          stepOutputKey: after('name'),
          value: 'a',
        },
      ],
      [
        'a composite without subfield',
        {
          type: 'FULL_NAME',
          operand: ViewFilterOperand.CONTAINS,
          stepOutputKey: after('name'),
          value: 'Jo',
        },
      ],
      [
        'a numeric address subfield',
        {
          type: 'ADDRESS',
          operand: ViewFilterOperand.CONTAINS,
          stepOutputKey: after('address.addressLat'),
          compositeFieldSubFieldName: 'addressLat',
          value: '4',
        },
      ],
      [
        'a relation without its id',
        {
          type: 'RELATION',
          operand: ViewFilterOperand.IS,
          stepOutputKey: after('company'),
          value: 'id',
        },
      ],
      [
        'a plain date in the past',
        {
          type: 'DATE',
          operand: ViewFilterOperand.IS_IN_PAST,
          stepOutputKey: after('closeDate'),
        },
      ],
      [
        'a week starting on Sunday',
        {
          type: 'DATE',
          operand: ViewFilterOperand.IS_RELATIVE,
          stepOutputKey: after('closeDate'),
          value: JSON.stringify({
            direction: 'THIS',
            unit: 'WEEK',
            firstDayOfTheWeek: 'SUNDAY',
          }),
        },
      ],
      [
        'a date-time below the millisecond',
        {
          type: 'DATE_TIME',
          operand: ViewFilterOperand.IS_BEFORE,
          stepOutputKey: after('createdAt'),
          value: '2026-03-01T10:00:00.0000001Z',
        },
      ],
      [
        'a text template value',
        {
          type: 'TEXT',
          operand: ViewFilterOperand.IS,
          stepOutputKey: after('name'),
          value: 'Hello {{trigger.properties.after.name}}',
        },
      ],
      [
        'another field as value',
        {
          type: 'TEXT',
          operand: ViewFilterOperand.IS,
          stepOutputKey: after('name'),
          value: after('otherName'),
        },
      ],
      [
        'a variable compared with contains',
        {
          type: 'TEXT',
          operand: ViewFilterOperand.CONTAINS,
          stepOutputKey: after('name'),
          value: before('name'),
        },
      ],
    ])('should not convert %s', (_, stepFilter) => {
      const result = convert(stepFilter);

      expect(result.isConvertible).toBe(false);
      expect(result).toHaveProperty(
        'reason',
        expect.stringMatching(/^Filter filter: \S/),
      );
    });

    it('should not convert a variable outside an update', () => {
      expect(
        convert(
          {
            type: 'TEXT',
            operand: ViewFilterOperand.IS,
            stepOutputKey: after('name'),
            value: before('name'),
          },
          'upserted',
        ).isConvertible,
      ).toBe(false);
    });
  });

  describe('groups', () => {
    const nameIs = (id: string, value: string, stepFilterGroupId: string) =>
      buildStepFilter({
        id,
        type: 'TEXT',
        operand: ViewFilterOperand.IS,
        stepOutputKey: after('name'),
        value,
        stepFilterGroupId,
      });

    it('should nest groups in parentheses, child groups by position', () => {
      expect(
        convertStepFiltersToRuleExpression({
          stepFilterGroups: [
            ROOT_GROUP,
            {
              id: 'second',
              logicalOperator: StepLogicalOperator.OR,
              parentStepFilterGroupId: 'root',
              positionInStepFilterGroup: 2,
            },
            {
              id: 'first',
              logicalOperator: StepLogicalOperator.OR,
              parentStepFilterGroupId: 'root',
              positionInStepFilterGroup: 1,
            },
          ],
          stepFilters: [
            nameIs('a', 'A', 'second'),
            nameIs('b', 'B', 'first'),
            nameIs('c', 'C', 'root'),
            nameIs('d', 'D', 'first'),
          ],
          databaseEventAction: 'created',
        }),
      ).toEqual({
        isConvertible: true,
        expression:
          "name == 'C' and (name == 'B' or name == 'D') and name == 'A'",
      });
    });

    it('should read an empty group as true and AND root groups', () => {
      expect(
        convertStepFiltersToRuleExpression({
          stepFilterGroups: [
            { id: 'empty', logicalOperator: StepLogicalOperator.OR },
            { id: 'other', logicalOperator: StepLogicalOperator.OR },
          ],
          stepFilters: [nameIs('a', 'A', 'other'), nameIs('b', 'B', 'other')],
          databaseEventAction: 'created',
        }),
      ).toEqual({
        isConvertible: true,
        expression: "name == 'A' or name == 'B'",
      });
    });

    it('should AND filters without groups and read no filter as true', () => {
      expect(
        convertStepFiltersToRuleExpression({
          stepFilters: [nameIs('a', 'A', 'x'), nameIs('b', 'B', 'x')],
          databaseEventAction: 'created',
        }),
      ).toEqual({
        isConvertible: true,
        expression: "name == 'A' and name == 'B'",
      });

      expect(
        convertStepFiltersToRuleExpression({
          stepFilterGroups: [ROOT_GROUP],
          databaseEventAction: 'created',
        }),
      ).toEqual({ isConvertible: true, expression: 'true' });
    });

    it.each<[string, StepFilterGroup[]]>([
      [
        'an unknown group',
        [{ id: 'other', logicalOperator: StepLogicalOperator.AND }],
      ],
      [
        'an unreachable group',
        [
          ROOT_GROUP,
          {
            id: 'orphan',
            logicalOperator: StepLogicalOperator.AND,
            parentStepFilterGroupId: 'missing',
          },
        ],
      ],
      ['duplicated groups', [ROOT_GROUP, ROOT_GROUP]],
    ])('should not convert %s', (_, stepFilterGroups) => {
      expect(
        convertStepFiltersToRuleExpression({
          stepFilterGroups,
          stepFilters: [nameIs('a', 'A', 'root')],
          databaseEventAction: 'created',
        }).isConvertible,
      ).toBe(false);
    });

    it('should name the filter that does not convert', () => {
      expect(
        convertStepFiltersToRuleExpression({
          stepFilterGroups: [ROOT_GROUP],
          stepFilters: [
            buildStepFilter({
              id: 'raw',
              type: 'RAW_JSON',
              operand: ViewFilterOperand.IS_EMPTY,
              stepOutputKey: after('payload'),
            }),
          ],
          databaseEventAction: 'created',
        }),
      ).toEqual({
        isConvertible: false,
        reason: expect.stringMatching(/^Filter raw: /),
      });
    });
  });

  it('should compile the expressions it emits', () => {
    const result = convertStepFiltersToRuleExpression({
      stepFilterGroups: [
        ROOT_GROUP,
        {
          id: 'any',
          logicalOperator: StepLogicalOperator.OR,
          parentStepFilterGroupId: 'root',
        },
      ],
      stepFilters: [
        buildStepFilter({
          id: 'stage',
          type: 'SELECT',
          operand: ViewFilterOperand.IS_NOT,
          stepOutputKey: after('stage'),
          value: '["NEW",""]',
        }),
        buildStepFilter({
          id: 'name',
          type: 'TEXT',
          operand: ViewFilterOperand.CONTAINS,
          stepOutputKey: after('name'),
          value: `it's "n"\\`,
          stepFilterGroupId: 'any',
        }),
        buildStepFilter({
          id: 'company',
          type: 'RELATION',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          stepOutputKey: before('company'),
          isFullRecord: true,
          stepFilterGroupId: 'any',
        }),
        buildStepFilter({
          id: 'closeDate',
          type: 'DATE',
          operand: ViewFilterOperand.IS_RELATIVE,
          stepOutputKey: after('closeDate'),
          value: JSON.stringify({
            direction: 'NEXT',
            amount: 2,
            unit: 'MONTH',
          }),
        }),
      ],
      databaseEventAction: 'updated',
    });

    expect(result.isConvertible).toBe(true);

    if (result.isConvertible) {
      expect(
        compileValidationRuleExpression({
          expression: result.expression,
          fields: FIELDS,
        }),
      ).toMatchObject({ isValid: true });
    }
  });
});
