import {
  FieldMetadataType,
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from '@/types';
import { computeRecordGqlOperationFilter } from '@/utils/filter/computeRecordGqlOperationFilter';
import { replaceWidgetFilterPeriodsWithDashboardFilter } from '@/utils/pageLayout/replaceWidgetFilterPeriodsWithDashboardFilter';

const CLOSE_DATE = 'close-date-field-id';
const CREATED_AT = 'created-at-field-id';
const STAGE = 'stage-field-id';

type TestRecordFilter = {
  id: string;
  fieldMetadataId: string;
  operand: ViewFilterOperand;
  value: string;
  recordFilterGroupId?: string | null;
};

const condition = (
  id: string,
  operand: ViewFilterOperand,
  {
    fieldMetadataId = CLOSE_DATE,
    recordFilterGroupId,
  }: { fieldMetadataId?: string; recordFilterGroupId?: string } = {},
): TestRecordFilter => ({
  id,
  fieldMetadataId,
  operand,
  value: '',
  recordFilterGroupId,
});

const THIS_QUARTER = condition('this-quarter', ViewFilterOperand.IS_RELATIVE);
const WON = condition('won', ViewFilterOperand.IS, { fieldMetadataId: STAGE });

const replace = (
  recordFilters: TestRecordFilter[],
  {
    recordFilterGroups = [],
    fieldMetadataIds = [CLOSE_DATE],
  }: {
    recordFilterGroups?: {
      id: string;
      logicalOperator: RecordFilterGroupLogicalOperator;
      parentRecordFilterGroupId?: string;
    }[];
    fieldMetadataIds?: string[];
  } = {},
) =>
  replaceWidgetFilterPeriodsWithDashboardFilter({
    filter: { recordFilters, recordFilterGroups },
    fieldMetadataIds,
  });

const getIds = (recordFilters: TestRecordFilter[]) =>
  recordFilters.map(({ id }) => id);

describe('replaceWidgetFilterPeriodsWithDashboardFilter', () => {
  it.each([
    ViewFilterOperand.IS_RELATIVE,
    ViewFilterOperand.IS,
    ViewFilterOperand.IS_TODAY,
  ])('should replace a %s period on the field', (operand) => {
    const period = condition('period', operand);

    expect(replace([period, WON])).toEqual({
      filter: { recordFilters: [WON], recordFilterGroups: [] },
      replacedRecordFilters: [period],
      stillFilteredFieldMetadataIds: [],
    });
  });

  it.each([
    ViewFilterOperand.IS_BEFORE,
    ViewFilterOperand.IS_AFTER,
    ViewFilterOperand.IS_IN_PAST,
    ViewFilterOperand.IS_IN_FUTURE,
    ViewFilterOperand.IS_EMPTY,
    ViewFilterOperand.IS_NOT_EMPTY,
  ])('should keep a lone %s condition on the field', (operand) => {
    const bound = condition('bound', operand);

    expect(replace([bound])).toEqual({
      filter: { recordFilters: [bound], recordFilterGroups: [] },
      replacedRecordFilters: [],
      stillFilteredFieldMetadataIds: [CLOSE_DATE],
    });
  });

  it('should replace an after + before pair like one period', () => {
    const after = condition('after', ViewFilterOperand.IS_AFTER);
    const before = condition('before', ViewFilterOperand.IS_BEFORE);

    const { filter, replacedRecordFilters } = replace([after, before, WON]);

    expect(getIds(filter.recordFilters)).toEqual(['won']);
    expect(getIds(replacedRecordFilters)).toEqual(['after', 'before']);
  });

  it('should replace a pair and a relative period together', () => {
    const after = condition('after', ViewFilterOperand.IS_AFTER);
    const before = condition('before', ViewFilterOperand.IS_BEFORE);

    expect(
      getIds(replace([after, THIS_QUARTER, before]).replacedRecordFilters),
    ).toEqual(['after', 'this-quarter', 'before']);
  });

  it('should replace two periods on the field', () => {
    const today = condition('today', ViewFilterOperand.IS_TODAY);

    const { filter, replacedRecordFilters } = replace([THIS_QUARTER, today]);

    expect(filter.recordFilters).toEqual([]);
    expect(getIds(replacedRecordFilters)).toEqual(['this-quarter', 'today']);
  });

  it('should keep a non-period condition next to a replaced period', () => {
    const inThePast = condition('in-the-past', ViewFilterOperand.IS_IN_PAST);

    expect(replace([THIS_QUARTER, inThePast])).toEqual({
      filter: { recordFilters: [inThePast], recordFilterGroups: [] },
      replacedRecordFilters: [THIS_QUARTER],
      stillFilteredFieldMetadataIds: [CLOSE_DATE],
    });
  });

  it('should keep a period on another field', () => {
    const createdThisQuarter = condition(
      'created',
      ViewFilterOperand.IS_RELATIVE,
      { fieldMetadataId: CREATED_AT },
    );

    expect(replace([createdThisQuarter]).filter.recordFilters).toEqual([
      createdThisQuarter,
    ]);
  });

  it('should replace nothing without a field, as with no value or an ignored or unresolved filter', () => {
    expect(replace([THIS_QUARTER], { fieldMetadataIds: [] })).toEqual({
      filter: { recordFilters: [THIS_QUARTER], recordFilterGroups: [] },
      replacedRecordFilters: [],
      stillFilteredFieldMetadataIds: [],
    });
  });

  it('should replace a period in a root AND group and keep the group it empties', () => {
    const rootGroup = {
      id: 'root',
      logicalOperator: RecordFilterGroupLogicalOperator.AND,
    };
    const period = condition('period', ViewFilterOperand.IS_RELATIVE, {
      recordFilterGroupId: 'root',
    });

    expect(replace([period], { recordFilterGroups: [rootGroup] })).toEqual({
      filter: { recordFilters: [], recordFilterGroups: [rootGroup] },
      replacedRecordFilters: [period],
      stillFilteredFieldMetadataIds: [],
    });
  });

  it('should keep a root AND group that still holds a condition', () => {
    const rootGroup = {
      id: 'root',
      logicalOperator: RecordFilterGroupLogicalOperator.AND,
    };
    const period = condition('period', ViewFilterOperand.IS_RELATIVE, {
      recordFilterGroupId: 'root',
    });
    const wonInRoot = { ...WON, recordFilterGroupId: 'root' };

    expect(
      replace([period, wonInRoot], { recordFilterGroups: [rootGroup] }).filter,
    ).toEqual({ recordFilters: [wonInRoot], recordFilterGroups: [rootGroup] });
  });

  it('should keep everything under a root OR group', () => {
    const rootGroup = {
      id: 'root',
      logicalOperator: RecordFilterGroupLogicalOperator.OR,
    };
    const thisMonth = condition('this-month', ViewFilterOperand.IS_RELATIVE, {
      recordFilterGroupId: 'root',
    });
    const wonInRoot = { ...WON, recordFilterGroupId: 'root' };

    expect(
      replace([thisMonth, wonInRoot], { recordFilterGroups: [rootGroup] }),
    ).toEqual({
      filter: {
        recordFilters: [thisMonth, wonInRoot],
        recordFilterGroups: [rootGroup],
      },
      replacedRecordFilters: [],
      stillFilteredFieldMetadataIds: [CLOSE_DATE],
    });
  });

  it('should keep a period and a pair inside a nested group', () => {
    const recordFilterGroups = [
      { id: 'root', logicalOperator: RecordFilterGroupLogicalOperator.AND },
      {
        id: 'nested',
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
        parentRecordFilterGroupId: 'root',
      },
    ];
    const nested = { recordFilterGroupId: 'nested' };
    const recordFilters = [
      condition('period', ViewFilterOperand.IS_RELATIVE, nested),
      condition('after', ViewFilterOperand.IS_AFTER, nested),
      condition('before', ViewFilterOperand.IS_BEFORE, nested),
    ];

    expect(replace(recordFilters, { recordFilterGroups }).filter).toEqual({
      recordFilters,
      recordFilterGroups,
    });
  });

  it('should not pair a top-level bound with one inside a nested group', () => {
    const recordFilterGroups = [
      { id: 'root', logicalOperator: RecordFilterGroupLogicalOperator.AND },
      {
        id: 'nested',
        logicalOperator: RecordFilterGroupLogicalOperator.OR,
        parentRecordFilterGroupId: 'root',
      },
    ];
    const recordFilters = [
      condition('after', ViewFilterOperand.IS_AFTER),
      condition('before', ViewFilterOperand.IS_BEFORE, {
        recordFilterGroupId: 'nested',
      }),
    ];

    expect(
      replace(recordFilters, { recordFilterGroups }).replacedRecordFilters,
    ).toEqual([]);
  });

  // Field types never change the rule: DATE and DATE_TIME store the same operands
  it('should treat every field the dashboard filter applies to alike', () => {
    const createdToday = condition(
      'created-today',
      ViewFilterOperand.IS_TODAY,
      {
        fieldMetadataId: CREATED_AT,
      },
    );

    expect(
      replace([THIS_QUARTER, createdToday], {
        fieldMetadataIds: [CLOSE_DATE, CREATED_AT],
      }).filter.recordFilters,
    ).toEqual([]);
  });

  it('should accept a missing filter', () => {
    expect(
      replaceWidgetFilterPeriodsWithDashboardFilter({
        filter: undefined,
        fieldMetadataIds: [CLOSE_DATE],
      }),
    ).toEqual({
      filter: { recordFilters: [], recordFilterGroups: [] },
      replacedRecordFilters: [],
      stillFilteredFieldMetadataIds: [],
    });
  });

  describe('with the root group the query compiler applies', () => {
    const FIELDS = [
      {
        id: CLOSE_DATE,
        name: 'closeDate',
        label: 'Close date',
        type: FieldMetadataType.DATE_TIME,
      },
      {
        id: STAGE,
        name: 'stage',
        label: 'Stage',
        type: FieldMetadataType.TEXT,
      },
    ];

    const compile = ({
      recordFilters,
      recordFilterGroups,
    }: ReturnType<typeof replace>['filter']) =>
      computeRecordGqlOperationFilter({
        fieldMetadataItems: FIELDS,
        recordFilters,
        recordFilterGroups,
        filterValueDependencies: { timeZone: 'UTC' },
      });

    const AND_GROUP = (id: string) => ({
      id,
      logicalOperator: RecordFilterGroupLogicalOperator.AND,
    });

    it('should never promote a parentless group the compiler ignored', () => {
      const day = {
        ...condition('day', ViewFilterOperand.IS, {
          recordFilterGroupId: 'first-root',
        }),
        value: '2026-01-01',
      };
      const stageInIgnoredGroup = {
        ...condition('won', ViewFilterOperand.CONTAINS, {
          fieldMetadataId: STAGE,
          recordFilterGroupId: 'ignored-root',
        }),
        value: 'won',
      };

      const { filter } = replace([day, stageInIgnoredGroup], {
        recordFilterGroups: [
          AND_GROUP('first-root'),
          AND_GROUP('ignored-root'),
        ],
      });

      expect(filter.recordFilters).toEqual([stageInIgnoredGroup]);
      expect(compile(filter)).toEqual({ and: [] });
    });

    it('should keep a period in a second parentless group', () => {
      const periodInIgnoredGroup = condition(
        'period',
        ViewFilterOperand.IS_RELATIVE,
        { recordFilterGroupId: 'ignored-root' },
      );

      expect(
        replace([periodInIgnoredGroup], {
          recordFilterGroups: [
            AND_GROUP('first-root'),
            AND_GROUP('ignored-root'),
          ],
        }).replacedRecordFilters,
      ).toEqual([]);
    });

    it('should pair an ungrouped bound with one in the root AND group, both ANDed at the root', () => {
      expect(
        getIds(
          replace(
            [
              condition('after', ViewFilterOperand.IS_AFTER),
              condition('before', ViewFilterOperand.IS_BEFORE, {
                recordFilterGroupId: 'root',
              }),
            ],
            { recordFilterGroups: [AND_GROUP('root')] },
          ).replacedRecordFilters,
        ),
      ).toEqual(['after', 'before']);
    });

    it('should replace an ungrouped period next to a root OR group and keep the group', () => {
      const thisQuarter = condition(
        'this-quarter',
        ViewFilterOperand.IS_RELATIVE,
      );
      const inThePastInOr = condition(
        'in-the-past',
        ViewFilterOperand.IS_IN_PAST,
        {
          recordFilterGroupId: 'root',
        },
      );
      const rootOrGroup = {
        id: 'root',
        logicalOperator: RecordFilterGroupLogicalOperator.OR,
      };

      expect(
        replace([thisQuarter, inThePastInOr], {
          recordFilterGroups: [rootOrGroup],
        }),
      ).toEqual({
        filter: {
          recordFilters: [inThePastInOr],
          recordFilterGroups: [rootOrGroup],
        },
        replacedRecordFilters: [thisQuarter],
        stillFilteredFieldMetadataIds: [CLOSE_DATE],
      });
    });

    it('should leave an emptied root group and its empty child to compile to no condition', () => {
      const period = condition('period', ViewFilterOperand.IS_RELATIVE, {
        recordFilterGroupId: 'root',
      });

      const { filter } = replace([period], {
        recordFilterGroups: [
          AND_GROUP('root'),
          {
            id: 'nested',
            logicalOperator: RecordFilterGroupLogicalOperator.OR,
            parentRecordFilterGroupId: 'root',
          },
        ],
      });

      expect(compile(filter)).toEqual({ and: [{ or: [] }] });
    });
  });
});
