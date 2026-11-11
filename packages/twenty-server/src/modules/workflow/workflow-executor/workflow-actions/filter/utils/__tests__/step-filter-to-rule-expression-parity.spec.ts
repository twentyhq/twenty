import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import {
  FieldMetadataType,
  RelationType,
  type StepFilter,
  type StepFilterGroup,
  StepLogicalOperator,
  type ValidationRuleDatabaseEventAction,
  type ValidationRuleFieldDescriptor,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  compileValidationRuleExpression,
  createValidationRuleEvaluator,
  getValidationRuleRecordsFromDatabaseEvent,
  isDefined,
  isPlainObject,
} from 'twenty-shared/utils';
import { convertStepFiltersToRuleExpression } from 'twenty-shared/workflow';

import { evaluateStepFilters } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-step-filters.util';

// Proves the converter: every filter it converts gives the legacy evaluator's
// result on each sample record, read after, before and on a deleted record

const NOW = '2026-11-11T10:00:00.000Z';

const FIRST_ID = '20202020-0000-4000-8000-000000000001';

const SECOND_ID = '20202020-0000-4000-8000-000000000002';

const MISSING = Symbol('missing');

const MISSING_ROOT = Symbol('missing root');

const NULL_ROOT = Symbol('null root');

type Sample = unknown;

type RecordValue = Record<string, unknown>;

type ParityCase = {
  type: string;
  path: string;
  operands: ViewFilterOperand[];
  values: string[];
  samples: Sample[];
  compositeFieldSubFieldName?: string;
  isFullRecord?: boolean;
};

type Mismatch = {
  value: string;
  sample: string;
  variant: string;
  expression: string;
  legacy: boolean;
  converted: boolean | string;
};

const ROOT_GROUP: StepFilterGroup = {
  id: 'root',
  logicalOperator: StepLogicalOperator.AND,
};

const FIELD_TYPE_BY_NAME: Record<string, FieldMetadataType> = {
  id: FieldMetadataType.UUID,
  name: FieldMetadataType.TEXT,
  stage: FieldMetadataType.SELECT,
  tags: FieldMetadataType.MULTI_SELECT,
  labels: FieldMetadataType.ARRAY,
  employees: FieldMetadataType.NUMBER,
  score: FieldMetadataType.NUMERIC,
  amount: FieldMetadataType.CURRENCY,
  rating: FieldMetadataType.RATING,
  isActive: FieldMetadataType.BOOLEAN,
  closeDate: FieldMetadataType.DATE,
  createdAt: FieldMetadataType.DATE_TIME,
  externalId: FieldMetadataType.UUID,
  fullName: FieldMetadataType.FULL_NAME,
  emails: FieldMetadataType.EMAILS,
  phones: FieldMetadataType.PHONES,
  address: FieldMetadataType.ADDRESS,
  links: FieldMetadataType.LINKS,
  createdBy: FieldMetadataType.ACTOR,
};

const FIELDS: ValidationRuleFieldDescriptor[] = Object.entries(
  FIELD_TYPE_BY_NAME,
).map(([name, type]) => ({ name, type, universalIdentifier: name }));

const COMPANY_FIELD: ValidationRuleFieldDescriptor = {
  name: 'company',
  type: FieldMetadataType.RELATION,
  universalIdentifier: 'company',
  relationType: RelationType.MANY_TO_ONE,
  relationTargetFields: [
    { name: 'id', type: FieldMetadataType.UUID, universalIdentifier: 'c-id' },
    {
      name: 'name',
      type: FieldMetadataType.TEXT,
      universalIdentifier: 'c-name',
    },
    {
      name: 'isActive',
      type: FieldMetadataType.BOOLEAN,
      universalIdentifier: 'c-is-active',
    },
    {
      name: 'address',
      type: FieldMetadataType.ADDRESS,
      universalIdentifier: 'c-address',
    },
  ],
};

const ALL_FIELDS = [...FIELDS, COMPANY_FIELD];

const BASE_RECORD: RecordValue = {
  id: FIRST_ID,
  name: null,
  stage: null,
  tags: null,
  labels: null,
  employees: null,
  score: null,
  amount: { amountMicros: null, currencyCode: null },
  rating: null,
  isActive: null,
  closeDate: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  externalId: null,
  fullName: { firstName: null, lastName: null },
  emails: { primaryEmail: null, additionalEmails: null },
  phones: {
    primaryPhoneNumber: null,
    primaryPhoneCountryCode: null,
    primaryPhoneCallingCode: null,
    additionalPhones: null,
  },
  address: {
    addressStreet1: null,
    addressStreet2: null,
    addressCity: null,
    addressState: null,
    addressPostcode: null,
    addressCountry: null,
    addressLat: null,
    addressLng: null,
  },
  links: { primaryLinkUrl: null, primaryLinkLabel: null, secondaryLinks: null },
  createdBy: {
    source: 'MANUAL',
    workspaceMemberId: null,
    name: 'Jane',
    context: {},
  },
  companyId: null,
};

const TEXT_OPERANDS = [
  ViewFilterOperand.IS,
  ViewFilterOperand.IS_NOT,
  ViewFilterOperand.CONTAINS,
  ViewFilterOperand.DOES_NOT_CONTAIN,
  ViewFilterOperand.IS_EMPTY,
  ViewFilterOperand.IS_NOT_EMPTY,
];

const SELECT_OPERANDS = [
  ViewFilterOperand.IS,
  ViewFilterOperand.IS_NOT,
  ViewFilterOperand.IS_EMPTY,
  ViewFilterOperand.IS_NOT_EMPTY,
];

const NUMBER_OPERANDS = [
  ViewFilterOperand.IS,
  ViewFilterOperand.IS_NOT,
  ViewFilterOperand.GREATER_THAN_OR_EQUAL,
  ViewFilterOperand.LESS_THAN_OR_EQUAL,
  ViewFilterOperand.IS_EMPTY,
  ViewFilterOperand.IS_NOT_EMPTY,
];

const DATE_OPERANDS = [
  ViewFilterOperand.IS,
  ViewFilterOperand.IS_BEFORE,
  ViewFilterOperand.IS_AFTER,
  ViewFilterOperand.IS_IN_FUTURE,
  ViewFilterOperand.IS_TODAY,
  ViewFilterOperand.IS_RELATIVE,
  ViewFilterOperand.IS_EMPTY,
  ViewFilterOperand.IS_NOT_EMPTY,
];

const TEXT_SAMPLES = [
  null,
  MISSING,
  '',
  ' ',
  'Acme',
  'acme',
  'Acme Corp',
  'null',
  'undefined',
  `O'Brien "\\`,
];

const TEXT_VALUES = [
  'Acme',
  '',
  'n',
  'u',
  'Corp',
  '["Acme","Corp"]',
  '[]',
  '"Acme"',
  `O'Brien "\\`,
];

const LIST_SAMPLES = [
  null,
  MISSING,
  [],
  ['VIP'],
  ['OLD'],
  ['VIP', 'OLD'],
  [''],
];

const LIST_VALUES = ['VIP', '["VIP","NEW"]', '["VIP"]', '[]', '', 'n', 'u'];

const relativeDate = (relativeDateFilter: Record<string, unknown>) =>
  JSON.stringify(relativeDateFilter);

const RELATIVE_DATE_VALUES = [
  relativeDate({ direction: 'PAST', amount: 3, unit: 'DAY' }),
  relativeDate({ direction: 'NEXT', amount: 1, unit: 'WEEK' }),
  relativeDate({ direction: 'THIS', unit: 'MONTH' }),
  relativeDate({
    direction: 'THIS',
    unit: 'WEEK',
    firstDayOfTheWeek: 'MONDAY',
  }),
  relativeDate({ direction: 'THIS', unit: 'DAY', timezone: 'Europe/Paris' }),
  relativeDate({ direction: 'PAST', amount: 2, unit: 'HOUR' }),
  relativeDate({ direction: 'PAST', unit: 'DAY' }),
  'not a relative date',
];

const PARITY_CASES: ParityCase[] = [
  {
    type: 'TEXT',
    path: 'name',
    operands: TEXT_OPERANDS,
    values: TEXT_VALUES,
    samples: TEXT_SAMPLES,
  },
  {
    type: 'TEXT',
    path: 'company.name',
    operands: TEXT_OPERANDS,
    values: ['Acme', '', 'n', '["Acme"]'],
    samples: [MISSING_ROOT, NULL_ROOT, null, '', 'Acme', 'Other'],
  },
  {
    type: 'FULL_NAME',
    path: 'fullName.firstName',
    compositeFieldSubFieldName: 'firstName',
    operands: TEXT_OPERANDS,
    values: ['Jo', '', 'n', '["Jo","Al"]'],
    samples: [null, '', 'Jo', 'John', 'Al', 'null'],
  },
  {
    type: 'EMAILS',
    path: 'emails.primaryEmail',
    compositeFieldSubFieldName: 'primaryEmail',
    operands: TEXT_OPERANDS,
    values: ['@acme.com', '', 'u'],
    samples: [null, '', 'a@acme.com', 'a@other.com'],
  },
  {
    type: 'EMAILS',
    path: 'emails.additionalEmails',
    compositeFieldSubFieldName: 'additionalEmails',
    operands: TEXT_OPERANDS,
    values: ['a@acme.com', '["a@acme.com","b@acme.com"]', '', 'n'],
    samples: [null, [], ['a@acme.com'], ['c@acme.com', 'b@acme.com']],
  },
  {
    type: 'PHONES',
    path: 'phones.primaryPhoneNumber',
    compositeFieldSubFieldName: 'primaryPhoneNumber',
    operands: TEXT_OPERANDS,
    values: ['612', ''],
    samples: [null, '', '612345678', '700000000'],
  },
  {
    type: 'PHONES',
    path: 'phones.additionalPhones',
    compositeFieldSubFieldName: 'additionalPhones',
    operands: TEXT_OPERANDS,
    values: ['612', '[]'],
    samples: [null, [], [{ number: '612', callingCode: '+33' }]],
  },
  {
    type: 'ADDRESS',
    path: 'address.addressCity',
    compositeFieldSubFieldName: 'addressCity',
    operands: TEXT_OPERANDS,
    values: ['Paris', '', '["Paris","Lyon"]'],
    samples: [null, '', 'Paris', 'Lyon', 'Nice'],
  },
  {
    type: 'ADDRESS',
    path: 'company.address.addressCountry',
    compositeFieldSubFieldName: 'addressCountry',
    operands: TEXT_OPERANDS,
    values: ['France', '["France"]', ''],
    samples: [MISSING_ROOT, null, '', 'France', 'Spain'],
  },
  {
    type: 'LINKS',
    path: 'links.primaryLinkUrl',
    compositeFieldSubFieldName: 'primaryLinkUrl',
    operands: TEXT_OPERANDS,
    values: ['acme.com', ''],
    samples: [null, '', 'https://acme.com', 'https://other.com'],
  },
  {
    type: 'LINKS',
    path: 'links.secondaryLinks',
    compositeFieldSubFieldName: 'secondaryLinks',
    operands: TEXT_OPERANDS,
    values: ['acme.com', '[]'],
    samples: [null, [], [{ url: 'acme.com', label: '' }]],
  },
  {
    type: 'ACTOR',
    path: 'createdBy.name',
    compositeFieldSubFieldName: 'name',
    operands: TEXT_OPERANDS,
    values: ['Jane', '', 'n'],
    samples: [null, '', 'Jane', 'Janet', 'Bob'],
  },
  {
    type: 'MULTI_SELECT',
    path: 'tags',
    operands: TEXT_OPERANDS,
    values: LIST_VALUES,
    samples: LIST_SAMPLES,
  },
  {
    type: 'ARRAY',
    path: 'labels',
    operands: TEXT_OPERANDS,
    values: LIST_VALUES,
    samples: LIST_SAMPLES,
  },
  {
    type: 'SELECT',
    path: 'stage',
    operands: SELECT_OPERANDS,
    values: [
      'NEW',
      '["NEW","WON"]',
      '["NEW",""]',
      '[""]',
      '[]',
      '',
      '"NEW"',
      '["NEW",3]',
      'not json',
    ],
    samples: [null, MISSING, '', 'NEW', 'WON', 'LOST', '"NEW"'],
  },
  {
    type: 'ACTOR',
    path: 'createdBy.source',
    compositeFieldSubFieldName: 'source',
    operands: SELECT_OPERANDS,
    values: ['["MANUAL","API"]', '["", "API"]', 'API'],
    samples: [null, 'MANUAL', 'API', 'EMAIL'],
  },
  {
    type: 'NUMBER',
    path: 'employees',
    operands: NUMBER_OPERANDS,
    values: ['10', '0', '-2.5', '', 'abc', ' 10 ', '0x0A', '-0'],
    samples: [null, MISSING, 0, 10, -2.5, 11, 9.99],
  },
  {
    type: 'NUMERIC',
    path: 'score',
    operands: [
      ViewFilterOperand.GREATER_THAN_OR_EQUAL,
      ViewFilterOperand.LESS_THAN_OR_EQUAL,
      ViewFilterOperand.IS_EMPTY,
      ViewFilterOperand.IS_NOT_EMPTY,
    ],
    values: ['10', '10.5', '0', 'abc'],
    samples: [null, '10', '10.50', '-3', '0', '1000000000000000000000'],
  },
  {
    type: 'CURRENCY',
    path: 'amount.amountMicros',
    compositeFieldSubFieldName: 'amountMicros',
    operands: NUMBER_OPERANDS,
    values: ['1000000', '0', ''],
    samples: [null, 0, 1000000, 2000000],
  },
  {
    type: 'CURRENCY',
    path: 'amount.currencyCode',
    compositeFieldSubFieldName: 'currencyCode',
    operands: SELECT_OPERANDS,
    values: ['["USD","EUR"]', 'USD', '', 'US', '[]', 'n'],
    samples: [null, '', 'USD', 'EUR', 'GBP'],
  },
  {
    type: 'RATING',
    path: 'rating',
    operands: NUMBER_OPERANDS,
    values: ['RATING_3', '3', '', 'abc', '3.5', 'RATING_6', '0'],
    samples: [null, MISSING, 'RATING_1', 'RATING_3', 'RATING_5'],
  },
  {
    type: 'UUID',
    path: 'externalId',
    operands: SELECT_OPERANDS,
    values: [FIRST_ID, ''],
    samples: [null, MISSING, '', FIRST_ID, SECOND_ID],
  },
  {
    type: 'RELATION',
    path: 'company',
    isFullRecord: true,
    operands: SELECT_OPERANDS,
    values: [FIRST_ID, ''],
    samples: [
      MISSING,
      null,
      { id: FIRST_ID, name: 'Acme' },
      { id: SECOND_ID },
      { name: 'Without id' },
    ],
  },
  {
    type: 'RELATION',
    path: 'company.id',
    operands: SELECT_OPERANDS,
    values: [FIRST_ID],
    samples: [MISSING_ROOT, NULL_ROOT, FIRST_ID, SECOND_ID],
  },
  {
    type: 'ACTOR',
    path: 'createdBy.workspaceMemberId',
    compositeFieldSubFieldName: 'workspaceMemberId',
    operands: SELECT_OPERANDS,
    values: [FIRST_ID, ''],
    samples: [null, FIRST_ID, SECOND_ID],
  },
  {
    type: 'BOOLEAN',
    path: 'isActive',
    operands: [ViewFilterOperand.IS],
    values: ['true', 'yes', ''],
    samples: [null, MISSING, true, false],
  },
  {
    type: 'BOOLEAN',
    path: 'company.isActive',
    operands: [ViewFilterOperand.IS],
    values: ['true'],
    samples: [MISSING_ROOT, null, true, false],
  },
  {
    type: 'DATE',
    path: 'closeDate',
    operands: DATE_OPERANDS,
    values: [
      '2026-11-11',
      '2026-11-10T15:00:00Z',
      '2026-11-11T00:00:00.000Z',
      '2026-11-12T00:00:00+02:00',
      '11/11/2026',
      'garbage',
      '',
      ...RELATIVE_DATE_VALUES,
    ],
    samples: [
      null,
      MISSING,
      '2026-11-09',
      '2026-11-10',
      '2026-11-11',
      '2026-11-12',
      '2026-10-31',
      '2025-01-01',
    ],
  },
  {
    type: 'DATE_TIME',
    path: 'createdAt',
    operands: [...DATE_OPERANDS, ViewFilterOperand.IS_IN_PAST],
    values: [
      '2026-11-11',
      '2026-11-11T05:00:00Z',
      '2026-11-11T00:00:00.000Z',
      '2026-11-11T10:00:00.000+02:00',
      '2026-11-11T09:59:59.999',
      'garbage',
      ...RELATIVE_DATE_VALUES,
    ],
    samples: [
      null,
      MISSING,
      '2026-11-11T09:59:59.999Z',
      '2026-11-11T10:00:00.000Z',
      '2026-11-11T10:00:00.001Z',
      '2026-11-10T23:59:59.999Z',
      '2026-11-11T00:00:00.000Z',
      '2026-11-11T05:00:00.000Z',
      '2026-11-11T08:00:00.000Z',
      '2026-11-12T00:00:00.000Z',
      '2026-11-08T12:00:00.000Z',
      '2026-10-01T12:00:00.000Z',
    ],
  },
];

const cloneRecord = (record: RecordValue): RecordValue =>
  JSON.parse(JSON.stringify(record));

const setSample = (path: string, sample: Sample): RecordValue => {
  const record = cloneRecord(BASE_RECORD);
  const segments = path.split('.');
  const [rootSegment] = segments;

  if (sample === MISSING_ROOT || sample === NULL_ROOT) {
    if (sample === MISSING_ROOT) {
      delete record[rootSegment];
    } else {
      record[rootSegment] = null;
    }

    return record;
  }

  let container = record;

  segments.slice(0, -1).forEach((segment) => {
    const child = container[segment];
    const childContainer: RecordValue = isPlainObject(child)
      ? { ...child }
      : {};

    container[segment] = childContainer;
    container = childContainer;
  });

  const lastSegment = segments[segments.length - 1];

  if (sample === MISSING) {
    delete container[lastSegment];
  } else {
    container[lastSegment] = sample;
  }

  return record;
};

const buildEvent = ({
  before,
  after,
}: {
  before?: RecordValue;
  after: RecordValue;
}): ObjectRecordEvent => ({
  recordId: FIRST_ID,
  properties: isDefined(before) ? { before, after } : { after },
});

const evaluateLegacy = ({
  stepFilters,
  stepFilterGroups,
  event,
}: {
  stepFilters: StepFilter[];
  stepFilterGroups: StepFilterGroup[];
  event: ObjectRecordEvent;
}) => {
  // The trigger listener reads a failing filter as not matching
  try {
    return evaluateStepFilters({
      stepFilters,
      stepFilterGroups,
      context: { trigger: event },
    });
  } catch {
    return false;
  }
};

const evaluateConverted = ({
  expression,
  event,
  databaseEventAction,
}: {
  expression: string;
  event: ObjectRecordEvent;
  databaseEventAction: ValidationRuleDatabaseEventAction;
}): boolean | string => {
  const { record, previousRecord } = getValidationRuleRecordsFromDatabaseEvent({
    event,
    action: databaseEventAction,
  });
  const result = createValidationRuleEvaluator({
    expression,
    fields: ALL_FIELDS,
  })({ record, previousRecord, now: NOW });

  return result.status === 'errored'
    ? `errored: ${result.errorMessage}`
    : result.status === 'passed';
};

const describeSample = (sample: Sample) =>
  typeof sample === 'symbol' ? sample.toString() : JSON.stringify(sample);

const buildStepFilter = ({
  parityCase,
  operand,
  value,
  snapshot,
}: {
  parityCase: ParityCase;
  operand: ViewFilterOperand;
  value: string;
  snapshot: 'after' | 'before';
}): StepFilter => ({
  id: 'filter',
  type: parityCase.type,
  operand,
  value,
  stepOutputKey: `{{trigger.properties.${snapshot}.${parityCase.path}}}`,
  stepFilterGroupId: ROOT_GROUP.id,
  compositeFieldSubFieldName: parityCase.compositeFieldSubFieldName,
  isFullRecord: parityCase.isFullRecord,
});

const VARIANTS: {
  name: string;
  snapshot: 'after' | 'before';
  databaseEventAction: ValidationRuleDatabaseEventAction;
  buildEvent: (sampleRecord: RecordValue) => ObjectRecordEvent;
}[] = [
  {
    name: 'created, reading after',
    snapshot: 'after',
    databaseEventAction: 'created',
    buildEvent: (sampleRecord) => buildEvent({ after: sampleRecord }),
  },
  {
    name: 'updated, reading before',
    snapshot: 'before',
    databaseEventAction: 'updated',
    buildEvent: (sampleRecord) =>
      buildEvent({ before: sampleRecord, after: cloneRecord(BASE_RECORD) }),
  },
  {
    name: 'deleted, reading before',
    snapshot: 'before',
    databaseEventAction: 'deleted',
    buildEvent: (sampleRecord) =>
      buildEvent({ before: sampleRecord, after: cloneRecord(BASE_RECORD) }),
  },
  {
    name: 'created, reading the missing before',
    snapshot: 'before',
    databaseEventAction: 'created',
    buildEvent: (sampleRecord) => buildEvent({ after: sampleRecord }),
  },
];

const compileOrThrow = (expression: string) => {
  const compilation = compileValidationRuleExpression({
    expression,
    fields: ALL_FIELDS,
  });

  if (!compilation.isValid) {
    throw new Error(
      `"${expression}" does not compile: ${compilation.errorMessage}`,
    );
  }
};

describe('step filter to rule expression parity', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(NOW));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe.each(PARITY_CASES)('$type on $path', (parityCase) => {
    it.each(parityCase.operands)('should match the legacy %s', (operand) => {
      const mismatches: Mismatch[] = [];
      let convertedCount = 0;

      for (const value of parityCase.values) {
        for (const variant of VARIANTS) {
          const stepFilters = [
            buildStepFilter({
              parityCase,
              operand,
              value,
              snapshot: variant.snapshot,
            }),
          ];
          const conversion = convertStepFiltersToRuleExpression({
            stepFilterGroups: [ROOT_GROUP],
            stepFilters,
            databaseEventAction: variant.databaseEventAction,
          });

          if (!conversion.isConvertible) {
            continue;
          }

          convertedCount++;
          compileOrThrow(conversion.expression);

          for (const sample of parityCase.samples) {
            const event = variant.buildEvent(
              setSample(parityCase.path, sample),
            );
            const legacy = evaluateLegacy({
              stepFilters,
              stepFilterGroups: [ROOT_GROUP],
              event,
            });
            const converted = evaluateConverted({
              expression: conversion.expression,
              event,
              databaseEventAction: variant.databaseEventAction,
            });

            if (legacy !== converted) {
              mismatches.push({
                value,
                sample: describeSample(sample),
                variant: variant.name,
                expression: conversion.expression,
                legacy,
                converted,
              });
            }
          }
        }
      }

      expect(convertedCount).toBeGreaterThan(0);
      expect(mismatches).toEqual([]);
    });
  });

  describe('field compared with its other snapshot on update', () => {
    const VARIABLE_CASES: {
      type: string;
      path: string;
      compositeFieldSubFieldName?: string;
      samples: Sample[];
    }[] = [
      { type: 'TEXT', path: 'name', samples: [null, '', 'Acme', 'Other'] },
      { type: 'NUMBER', path: 'employees', samples: [null, 0, 10] },
      { type: 'UUID', path: 'externalId', samples: [null, '', FIRST_ID] },
      {
        type: 'CURRENCY',
        path: 'amount.amountMicros',
        compositeFieldSubFieldName: 'amountMicros',
        samples: [null, 0, 1000000],
      },
      {
        type: 'FULL_NAME',
        path: 'fullName.firstName',
        compositeFieldSubFieldName: 'firstName',
        samples: [null, '', 'Jo', 'Al'],
      },
    ];

    it.each(
      VARIABLE_CASES.flatMap((variableCase) =>
        [ViewFilterOperand.IS, ViewFilterOperand.IS_NOT].flatMap((operand) =>
          (['after', 'before'] as const).map((snapshot) => ({
            ...variableCase,
            operand,
            snapshot,
          })),
        ),
      ),
    )(
      'should match the legacy $type $operand on $snapshot',
      ({
        type,
        path,
        compositeFieldSubFieldName,
        samples,
        operand,
        snapshot,
      }) => {
        const otherSnapshot = snapshot === 'after' ? 'before' : 'after';
        const stepFilters: StepFilter[] = [
          {
            id: 'filter',
            type,
            operand,
            value: `{{trigger.properties.${otherSnapshot}.${path}}}`,
            stepOutputKey: `{{trigger.properties.${snapshot}.${path}}}`,
            stepFilterGroupId: ROOT_GROUP.id,
            compositeFieldSubFieldName,
          },
        ];
        const conversion = convertStepFiltersToRuleExpression({
          stepFilterGroups: [ROOT_GROUP],
          stepFilters,
          databaseEventAction: 'updated',
        });

        if (!conversion.isConvertible) {
          throw new Error(conversion.reason);
        }

        compileOrThrow(conversion.expression);

        const mismatches = samples.flatMap((afterSample) =>
          samples.flatMap((beforeSample) => {
            const event = buildEvent({
              before: setSample(path, beforeSample),
              after: setSample(path, afterSample),
            });
            const legacy = evaluateLegacy({
              stepFilters,
              stepFilterGroups: [ROOT_GROUP],
              event,
            });
            const converted = evaluateConverted({
              expression: conversion.expression,
              event,
              databaseEventAction: 'updated',
            });

            return legacy === converted
              ? []
              : [{ afterSample, beforeSample, legacy, converted }];
          }),
        );

        expect(mismatches).toEqual([]);
      },
    );
  });

  it('should match the legacy evaluator on nested groups', () => {
    const stepFilterGroups: StepFilterGroup[] = [
      ROOT_GROUP,
      {
        id: 'any',
        logicalOperator: StepLogicalOperator.OR,
        parentStepFilterGroupId: ROOT_GROUP.id,
        positionInStepFilterGroup: 1,
      },
      {
        id: 'all',
        logicalOperator: StepLogicalOperator.AND,
        parentStepFilterGroupId: 'any',
      },
      {
        id: 'empty',
        logicalOperator: StepLogicalOperator.OR,
        parentStepFilterGroupId: ROOT_GROUP.id,
        positionInStepFilterGroup: 0,
      },
    ];
    const stepFilters: StepFilter[] = [
      {
        id: 'stage',
        type: 'SELECT',
        operand: ViewFilterOperand.IS_NOT,
        value: '["LOST"]',
        stepOutputKey: '{{trigger.properties.after.stage}}',
        stepFilterGroupId: ROOT_GROUP.id,
      },
      {
        id: 'name',
        type: 'TEXT',
        operand: ViewFilterOperand.CONTAINS,
        value: 'Acme',
        stepOutputKey: '{{trigger.properties.after.name}}',
        stepFilterGroupId: 'any',
      },
      {
        id: 'employees',
        type: 'NUMBER',
        operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
        value: '10',
        stepOutputKey: '{{trigger.properties.after.employees}}',
        stepFilterGroupId: 'all',
      },
      {
        id: 'previousEmployees',
        type: 'NUMBER',
        operand: ViewFilterOperand.LESS_THAN_OR_EQUAL,
        value: '9',
        stepOutputKey: '{{trigger.properties.before.employees}}',
        stepFilterGroupId: 'all',
      },
    ];
    const conversion = convertStepFiltersToRuleExpression({
      stepFilterGroups,
      stepFilters,
      databaseEventAction: 'updated',
    });

    if (!conversion.isConvertible) {
      throw new Error(conversion.reason);
    }

    compileOrThrow(conversion.expression);

    const records = ['LOST', 'NEW'].flatMap((stage) =>
      [null, 'Acme', 'Other'].flatMap((name) =>
        [null, 5, 12].flatMap((employees) =>
          [null, 5, 12].map((previousEmployees) =>
            buildEvent({
              before: { ...BASE_RECORD, employees: previousEmployees },
              after: { ...BASE_RECORD, stage, name, employees },
            }),
          ),
        ),
      ),
    );

    const results = records.map((event) => ({
      legacy: evaluateLegacy({ stepFilters, stepFilterGroups, event }),
      converted: evaluateConverted({
        expression: conversion.expression,
        event,
        databaseEventAction: 'updated',
      }),
    }));

    expect(results.some(({ legacy }) => legacy)).toBe(true);
    expect(
      results.filter(({ legacy, converted }) => legacy !== converted),
    ).toEqual([]);
  });
});
