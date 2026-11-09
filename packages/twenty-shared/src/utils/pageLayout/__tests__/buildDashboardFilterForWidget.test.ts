import {
  FieldMetadataType,
  FirstDayOfTheWeek,
  PageLayoutFilterType,
  type PageLayoutFilterCondition,
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from '@/types';
import { computeRecordGqlOperationFilter } from '@/utils/filter/computeRecordGqlOperationFilter';
import { combineFilters } from '@/utils/filter/utils/combineFilters';
import { buildDashboardFilterForWidget } from '@/utils/pageLayout/buildDashboardFilterForWidget';
import { InvalidDashboardFilterError } from '@/utils/pageLayout/InvalidDashboardFilterError';

const PERIOD_FILTER_ID = 'period-filter-id';
const SIGNED_FILTER_ID = 'signed-filter-id';
const VIEWER_TIME_ZONE = 'Europe/Paris';

const CLOSE_DATE_FIELD = {
  id: 'close-date-field-id',
  name: 'closeDate',
  label: 'Close date',
  type: FieldMetadataType.DATE,
  isActive: true,
};

const CREATED_AT_FIELD = {
  id: 'created-at-field-id',
  name: 'createdAt',
  label: 'Creation date',
  type: FieldMetadataType.DATE_TIME,
  isActive: true,
};

const NAME_FIELD = {
  id: 'name-field-id',
  name: 'name',
  label: 'Name',
  type: FieldMetadataType.TEXT,
  isActive: true,
};

const FIELDS = [CLOSE_DATE_FIELD, CREATED_AT_FIELD, NAME_FIELD];

const JANUARY_2026: PageLayoutFilterCondition[] = [
  { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' },
  { operand: ViewFilterOperand.IS_BEFORE, value: '2026-02-01' },
];

const dateFilterValue = (
  pageLayoutFilterId: string,
  conditions: PageLayoutFilterCondition[],
) => ({ pageLayoutFilterId, type: PageLayoutFilterType.DATE, conditions });

const buildForWidget = (
  args: Partial<Parameters<typeof buildDashboardFilterForWidget>[0]>,
) =>
  buildDashboardFilterForWidget({
    values: [],
    bindings: null,
    groupByFieldMetadataIds: [],
    widgetFilterFieldMetadataIds: [],
    fields: FIELDS,
    timeZone: VIEWER_TIME_ZONE,
    firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
    ...args,
  });

const buildForBinding = ({
  fieldMetadataId,
  conditions,
  timeZone = VIEWER_TIME_ZONE,
  firstDayOfTheWeek = FirstDayOfTheWeek.MONDAY,
}: {
  fieldMetadataId: string;
  conditions: PageLayoutFilterCondition[];
  timeZone?: string;
  firstDayOfTheWeek?: FirstDayOfTheWeek;
}) =>
  buildForWidget({
    values: [dateFilterValue(PERIOD_FILTER_ID, conditions)],
    bindings: [{ pageLayoutFilterId: PERIOD_FILTER_ID, fieldMetadataId }],
    timeZone,
    firstDayOfTheWeek,
  });

const toGqlOperationFilter = (
  recordFilters: Parameters<
    typeof computeRecordGqlOperationFilter
  >[0]['recordFilters'],
  timeZone = VIEWER_TIME_ZONE,
) =>
  computeRecordGqlOperationFilter({
    fieldMetadataItems: FIELDS,
    recordFilters,
    recordFilterGroups: [],
    filterValueDependencies: { timeZone },
  });

describe('buildDashboardFilterForWidget', () => {
  it('should return no record filter when no filter has a value', () => {
    expect(buildForWidget({ values: [] })).toEqual({
      recordFilters: [],
      appliedFields: [],
      notAppliedPageLayoutFilterIds: [],
      unresolvedPageLayoutFilterIds: [],
    });
  });

  it('should apply a filter the widget does not bind on its inferred field and name it', () => {
    const { recordFilters, appliedFields } = buildForWidget({
      values: [dateFilterValue(PERIOD_FILTER_ID, JANUARY_2026)],
      groupByFieldMetadataIds: [CLOSE_DATE_FIELD.id],
    });

    expect(appliedFields).toEqual([
      {
        pageLayoutFilterId: PERIOD_FILTER_ID,
        fieldMetadataId: CLOSE_DATE_FIELD.id,
        source: 'GROUP_BY',
      },
    ]);
    expect(recordFilters.map(({ fieldMetadataId }) => fieldMetadataId)).toEqual(
      [CLOSE_DATE_FIELD.id, CLOSE_DATE_FIELD.id],
    );
  });

  it('should report the filters a widget does not apply or cannot resolve, and filter on the others', () => {
    const result = buildForWidget({
      values: [
        dateFilterValue(PERIOD_FILTER_ID, JANUARY_2026),
        dateFilterValue(SIGNED_FILTER_ID, JANUARY_2026),
      ],
      bindings: [
        { pageLayoutFilterId: SIGNED_FILTER_ID, fieldMetadataId: null },
      ],
      fields: [NAME_FIELD],
    });

    expect(result).toEqual({
      recordFilters: [],
      appliedFields: [],
      notAppliedPageLayoutFilterIds: [SIGNED_FILTER_ID],
      unresolvedPageLayoutFilterIds: [PERIOD_FILTER_ID],
    });
  });

  it('should report an override to a field that is not given as unresolved', () => {
    const { recordFilters, appliedFields, unresolvedPageLayoutFilterIds } =
      buildForWidget({
        values: [
          dateFilterValue(PERIOD_FILTER_ID, JANUARY_2026),
          dateFilterValue(SIGNED_FILTER_ID, JANUARY_2026),
        ],
        bindings: [
          {
            pageLayoutFilterId: SIGNED_FILTER_ID,
            fieldMetadataId: 'unreadable-field-id',
          },
        ],
      });

    expect(recordFilters).toHaveLength(2);
    expect(appliedFields).toEqual([
      {
        pageLayoutFilterId: PERIOD_FILTER_ID,
        fieldMetadataId: CREATED_AT_FIELD.id,
        source: 'CREATED_AT',
      },
    ]);
    expect(unresolvedPageLayoutFilterIds).toEqual([SIGNED_FILTER_ID]);
  });

  it.each([
    [
      'a widget filter resolution',
      { widgetFilterFieldMetadataIds: [CLOSE_DATE_FIELD.id] },
      'WIDGET_FILTER',
    ],
    [
      'a group-by field its own filter also uses',
      {
        groupByFieldMetadataIds: [CLOSE_DATE_FIELD.id],
        widgetFilterFieldMetadataIds: [NAME_FIELD.id, CLOSE_DATE_FIELD.id],
      },
      'GROUP_BY',
    ],
    [
      'an override its own filter also uses',
      {
        bindings: [
          {
            pageLayoutFilterId: PERIOD_FILTER_ID,
            fieldMetadataId: CLOSE_DATE_FIELD.id,
          },
        ],
        widgetFilterFieldMetadataIds: [CLOSE_DATE_FIELD.id],
      },
      'OVERRIDE',
    ],
  ])(
    'should report the rule that chose the field of %s',
    (_title, widgetInputs, expectedSource) => {
      const { appliedFields } = buildForWidget({
        values: [dateFilterValue(PERIOD_FILTER_ID, JANUARY_2026)],
        ...widgetInputs,
      });

      expect(appliedFields).toEqual([
        {
          pageLayoutFilterId: PERIOD_FILTER_ID,
          fieldMetadataId: CLOSE_DATE_FIELD.id,
          source: expectedSource,
        },
      ]);
    },
  );

  it('should AND the conditions of an absolute range on the bound field', () => {
    const { recordFilters } = buildForBinding({
      fieldMetadataId: CLOSE_DATE_FIELD.id,
      conditions: JANUARY_2026,
    });

    expect(recordFilters).toEqual([
      {
        fieldMetadataId: CLOSE_DATE_FIELD.id,
        operand: ViewFilterOperand.IS_AFTER,
        value: '2026-01-01',
      },
      {
        fieldMetadataId: CLOSE_DATE_FIELD.id,
        operand: ViewFilterOperand.IS_BEFORE,
        value: '2026-02-01',
      },
    ]);
    expect(toGqlOperationFilter(recordFilters)).toEqual({
      and: [
        { closeDate: { gte: '2026-01-01' } },
        { closeDate: { lt: '2026-02-01' } },
      ],
    });
  });

  it('should apply every filter to its own field', () => {
    const { recordFilters } = buildForWidget({
      values: [
        dateFilterValue(PERIOD_FILTER_ID, [
          { operand: ViewFilterOperand.IS, value: '2026-01-15' },
        ]),
        dateFilterValue(SIGNED_FILTER_ID, [
          { operand: ViewFilterOperand.IS_BEFORE, value: '2026-03-01' },
        ]),
      ],
      bindings: [
        {
          pageLayoutFilterId: PERIOD_FILTER_ID,
          fieldMetadataId: CLOSE_DATE_FIELD.id,
        },
      ],
    });

    expect(toGqlOperationFilter(recordFilters)).toEqual({
      and: [
        { closeDate: { eq: '2026-01-15' } },
        { createdAt: { lt: '2026-02-28T23:00:00Z' } },
      ],
    });
  });

  it('should keep plain dates for a DATE field and use the viewer time zone for a DATE_TIME field', () => {
    const dateFilter = buildForBinding({
      fieldMetadataId: CLOSE_DATE_FIELD.id,
      conditions: JANUARY_2026,
    });
    const dateTimeFilter = buildForBinding({
      fieldMetadataId: CREATED_AT_FIELD.id,
      conditions: JANUARY_2026,
    });

    expect(dateFilter.recordFilters.map(({ value }) => value)).toEqual([
      '2026-01-01',
      '2026-02-01',
    ]);
    expect(toGqlOperationFilter(dateTimeFilter.recordFilters)).toEqual({
      and: [
        { createdAt: { gte: '2025-12-31T23:00:00Z' } },
        { createdAt: { lt: '2026-01-31T23:00:00Z' } },
      ],
    });
  });

  it('should turn IS on a DATE_TIME field into the day in the viewer time zone', () => {
    const { recordFilters } = buildForBinding({
      fieldMetadataId: CREATED_AT_FIELD.id,
      conditions: [{ operand: ViewFilterOperand.IS, value: '2026-07-14' }],
    });

    expect(toGqlOperationFilter(recordFilters)).toEqual({
      and: [
        { createdAt: { gte: '2026-07-13T22:00:00Z' } },
        { createdAt: { lt: '2026-07-14T22:00:00Z' } },
      ],
    });
  });

  it('should keep IS on a DATE_TIME field to the 23 hours of a day that skips midnight', () => {
    const { recordFilters } = buildForBinding({
      fieldMetadataId: CREATED_AT_FIELD.id,
      conditions: [{ operand: ViewFilterOperand.IS, value: '2026-09-06' }],
      timeZone: 'America/Santiago',
    });

    expect(toGqlOperationFilter(recordFilters, 'America/Santiago')).toEqual({
      and: [
        { createdAt: { gte: '2026-09-06T04:00:00Z' } },
        { createdAt: { lt: '2026-09-07T03:00:00Z' } },
      ],
    });
  });

  it.each([
    [
      'PAST_1_MONTH;;America/Los_Angeles;;SUNDAY;;',
      'PAST_1_MONTH;;Europe/Paris;;SUNDAY;;',
    ],
    ['THIS_1_QUARTER', 'THIS_1_QUARTER;;Europe/Paris;;MONDAY;;'],
  ])(
    'should replace the time zone of relative value %s with the viewer time zone',
    (storedValue, expectedValue) => {
      const { recordFilters } = buildForBinding({
        fieldMetadataId: CREATED_AT_FIELD.id,
        conditions: [
          { operand: ViewFilterOperand.IS_RELATIVE, value: storedValue },
        ],
      });

      expect(recordFilters).toEqual([
        {
          fieldMetadataId: CREATED_AT_FIELD.id,
          operand: ViewFilterOperand.IS_RELATIVE,
          value: expectedValue,
        },
      ]);
    },
  );

  it.each([
    ['PAST_2_WEEK', 'PAST_2_WEEK;;Europe/Paris;;SUNDAY;;'],
    ['PAST_2_WEEK;;UTC;;SATURDAY;;', 'PAST_2_WEEK;;Europe/Paris;;SATURDAY;;'],
  ])(
    'should start the weeks of relative value %s on the given first day unless it embeds one',
    (storedValue, expectedValue) => {
      const { recordFilters } = buildForBinding({
        fieldMetadataId: CREATED_AT_FIELD.id,
        conditions: [
          { operand: ViewFilterOperand.IS_RELATIVE, value: storedValue },
        ],
        firstDayOfTheWeek: FirstDayOfTheWeek.SUNDAY,
      });

      expect(recordFilters.map(({ value }) => value)).toEqual([expectedValue]);
    },
  );

  it.each([
    [ViewFilterOperand.IS_AFTER, '2026-01-01T10:00'],
    [ViewFilterOperand.IS_AFTER, '2026-01-01[u-ca=hebrew]'],
    [ViewFilterOperand.IS_BEFORE, '+012026-01-01'],
    [ViewFilterOperand.IS_BEFORE, '0000-01-01'],
    [ViewFilterOperand.IS, '20260101'],
    [ViewFilterOperand.IS, '2026-02-30'],
    [ViewFilterOperand.IS_RELATIVE, 'LAST_MONTH'],
    [ViewFilterOperand.IS_RELATIVE, 'PAST_5000_YEAR'],
    [ViewFilterOperand.IS_RELATIVE, 'PAST_1000_SECOND'],
  ])(
    'should throw on %s value %s instead of passing it through',
    (operand, value) => {
      expect(() =>
        buildForBinding({
          fieldMetadataId: CLOSE_DATE_FIELD.id,
          conditions: [{ operand, value }],
        }),
      ).toThrow(InvalidDashboardFilterError);
    },
  );

  it.each([
    [ViewFilterOperand.IS, '9999-12-31', 'America/Los_Angeles'],
    [ViewFilterOperand.IS_AFTER, '0001-01-01', 'Asia/Tokyo'],
  ])(
    'should throw on %s %s in %s on a DATE_TIME field, whose bound leaves years 0001 to 9999',
    (operand, value, timeZone) => {
      expect(() =>
        buildForBinding({
          fieldMetadataId: CREATED_AT_FIELD.id,
          conditions: [{ operand, value }],
          timeZone,
        }),
      ).toThrow(
        new InvalidDashboardFilterError(
          `Dashboard filter date "${value}" is out of range in time zone "${timeZone}"`,
        ),
      );
    },
  );

  it('should throw on a time zone Temporal does not know', () => {
    expect(() =>
      buildForBinding({
        fieldMetadataId: CREATED_AT_FIELD.id,
        conditions: [{ operand: ViewFilterOperand.IS, value: '2026-01-15' }],
        timeZone: 'Mars/Olympus_Mons',
      }),
    ).toThrow(InvalidDashboardFilterError);
  });

  it('should keep an OR-rooted widget filter whole inside the AND', () => {
    const widgetGqlOperationFilter = computeRecordGqlOperationFilter({
      fieldMetadataItems: FIELDS,
      recordFilters: [
        {
          fieldMetadataId: NAME_FIELD.id,
          operand: ViewFilterOperand.CONTAINS,
          value: 'Acme',
          recordFilterGroupId: 'root-group-id',
        },
        {
          fieldMetadataId: NAME_FIELD.id,
          operand: ViewFilterOperand.CONTAINS,
          value: 'Globex',
          recordFilterGroupId: 'root-group-id',
        },
      ],
      recordFilterGroups: [
        {
          id: 'root-group-id',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
        },
      ],
      filterValueDependencies: { timeZone: VIEWER_TIME_ZONE },
    });

    const dashboardGqlOperationFilter = toGqlOperationFilter(
      buildForBinding({
        fieldMetadataId: CLOSE_DATE_FIELD.id,
        conditions: JANUARY_2026,
      }).recordFilters,
    );

    expect(
      combineFilters([widgetGqlOperationFilter, dashboardGqlOperationFilter]),
    ).toEqual({
      and: [
        {
          or: [{ name: { ilike: '%Acme%' } }, { name: { ilike: '%Globex%' } }],
        },
        {
          and: [
            { closeDate: { gte: '2026-01-01' } },
            { closeDate: { lt: '2026-02-01' } },
          ],
        },
      ],
    });
  });
});
