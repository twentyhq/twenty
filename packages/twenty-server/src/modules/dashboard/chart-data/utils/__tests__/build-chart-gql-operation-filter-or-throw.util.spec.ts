import { CalendarStartDay } from 'twenty-shared/constants';
import {
  type ChartFilter,
  type DashboardFilterBinding,
  type DashboardFilterValue,
  FieldMetadataType,
  PageLayoutFilterType,
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import {
  ChartDataException,
  ChartDataExceptionCode,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';
import { buildChartGqlOperationFilterOrThrow } from 'src/modules/dashboard/chart-data/utils/build-chart-gql-operation-filter-or-throw.util';
import { convertChartFilterToGqlOperationFilter } from 'src/modules/dashboard/chart-data/utils/convert-chart-filter-to-gql-operation-filter.util';

jest.mock(
  'src/modules/dashboard/chart-data/utils/convert-chart-filter-to-gql-operation-filter.util',
  () => {
    const actualModule = jest.requireActual(
      'src/modules/dashboard/chart-data/utils/convert-chart-filter-to-gql-operation-filter.util',
    );

    return {
      convertChartFilterToGqlOperationFilter: jest.fn(
        actualModule.convertChartFilterToGqlOperationFilter,
      ),
    };
  },
);

const OPPORTUNITY_OBJECT_ID = 'opportunity-object-id';
const PERIOD_FILTER_ID = '1d5ec6d4-7e43-4a5c-9b1b-2d4f8a0e3c11';
const NOT_APPLIED_FILTER_ID = '6b2f0c3e-91a7-4f08-8d3e-5a7c2e9b4d22';
const VIEWER_TIME_ZONE = 'Europe/Paris';

const buildOpportunityField = (
  name: string,
  type: FieldMetadataType,
  objectMetadataId = OPPORTUNITY_OBJECT_ID,
) =>
  getFlatFieldMetadataMock({
    id: `${objectMetadataId}-${name}-field-id`,
    name,
    universalIdentifier: `${objectMetadataId}-${name}-universal-id`,
    objectMetadataId,
    type,
  });

const CREATED_AT_FIELD = buildOpportunityField(
  'createdAt',
  FieldMetadataType.DATE_TIME,
);
const CLOSE_DATE_FIELD = buildOpportunityField(
  'closeDate',
  FieldMetadataType.DATE,
);
const DELETED_AT_FIELD = buildOpportunityField(
  'deletedAt',
  FieldMetadataType.DATE_TIME,
);
const NAME_FIELD = buildOpportunityField('name', FieldMetadataType.TEXT);
const COMPANY_CREATED_AT_FIELD = buildOpportunityField(
  'createdAt',
  FieldMetadataType.DATE_TIME,
  'company-object-id',
);

const flatFieldMetadataMaps = addAllFlatEntitiesToFlatEntityMaps({
  flatEntities: [
    CREATED_AT_FIELD,
    CLOSE_DATE_FIELD,
    DELETED_AT_FIELD,
    NAME_FIELD,
    COMPANY_CREATED_AT_FIELD,
  ],
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const flatObjectMetadataMaps = createEmptyFlatEntityMaps();

const OPPORTUNITY_OBJECT = getFlatObjectMetadataMock({
  id: OPPORTUNITY_OBJECT_ID,
  universalIdentifier: 'opportunity-object-universal-id',
  fieldIds: [
    CREATED_AT_FIELD.id,
    CLOSE_DATE_FIELD.id,
    DELETED_AT_FIELD.id,
    NAME_FIELD.id,
  ],
});

const periodValue = (
  operand: ViewFilterOperand,
  value: string,
): DashboardFilterValue[] => [
  {
    pageLayoutFilterId: PERIOD_FILTER_ID,
    type: PageLayoutFilterType.DATE,
    conditions: [{ operand, value }],
  },
];

const buildDashboardFilter = ({
  widgetFilter,
  dashboardFilterValues,
  dashboardFilterBindings = null,
  groupByFieldMetadataIds = [],
  widgetFilterFieldMetadataIds = [],
  flatObjectMetadata = OPPORTUNITY_OBJECT,
  timeZone = VIEWER_TIME_ZONE,
  firstDayOfTheWeek = CalendarStartDay.MONDAY,
}: Partial<Parameters<typeof buildChartGqlOperationFilterOrThrow>[0]> &
  Pick<
    Parameters<typeof buildChartGqlOperationFilterOrThrow>[0],
    'dashboardFilterValues'
  >) =>
  buildChartGqlOperationFilterOrThrow({
    widgetFilter,
    dashboardFilterValues,
    timeZone,
    dashboardFilterBindings,
    groupByFieldMetadataIds,
    widgetFilterFieldMetadataIds,
    firstDayOfTheWeek,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  });

const buildFilterBoundTo = ({
  fieldMetadataId,
  ...rest
}: Parameters<typeof buildDashboardFilter>[0] & {
  fieldMetadataId: string | null;
}) =>
  buildDashboardFilter({
    ...rest,
    dashboardFilterBindings: [
      { pageLayoutFilterId: PERIOD_FILTER_ID, fieldMetadataId },
    ],
  });

type RejectedBindingCase = [string, string, DashboardFilterValue[], string];

const catchChartDataException = (run: () => unknown) => {
  try {
    run();
  } catch (error) {
    if (error instanceof ChartDataException) {
      return error;
    }

    throw error;
  }

  throw new Error('Expected a ChartDataException');
};

describe('buildChartGqlOperationFilterOrThrow', () => {
  it.each([null, []])(
    'should return an empty filter for %p dashboard filter values, even without a time zone',
    (dashboardFilterValues) => {
      expect(
        buildFilterBoundTo({
          fieldMetadataId: CREATED_AT_FIELD.id,
          dashboardFilterValues,
          timeZone: '',
        }),
      ).toEqual({});
    },
  );

  it('should filter the overriding field in the given time zone and skip the filters the widget does not apply', () => {
    const notAppliedBinding: DashboardFilterBinding = {
      pageLayoutFilterId: NOT_APPLIED_FILTER_ID,
      fieldMetadataId: null,
    };

    expect(
      buildDashboardFilter({
        dashboardFilterBindings: [
          {
            pageLayoutFilterId: PERIOD_FILTER_ID,
            fieldMetadataId: CREATED_AT_FIELD.id,
          },
          notAppliedBinding,
        ],
        groupByFieldMetadataIds: [CLOSE_DATE_FIELD.id],
        dashboardFilterValues: [
          ...periodValue(ViewFilterOperand.IS_AFTER, '2026-01-01'),
          {
            pageLayoutFilterId: NOT_APPLIED_FILTER_ID,
            type: PageLayoutFilterType.DATE,
            conditions: [
              { operand: ViewFilterOperand.IS_BEFORE, value: '2020-01-01' },
            ],
          },
        ],
      }),
    ).toEqual({ createdAt: { gte: '2025-12-31T23:00:00Z' } });
  });

  it.each([
    ['the date it groups by', [CLOSE_DATE_FIELD.id], [], 'closeDate'],
    [
      'the date it filters on when it groups by no date',
      [NAME_FIELD.id],
      [CLOSE_DATE_FIELD.id],
      'closeDate',
    ],
    ['createdAt otherwise', [NAME_FIELD.id], [NAME_FIELD.id], 'createdAt'],
  ])(
    'should filter a widget without binding on %s',
    (
      _,
      groupByFieldMetadataIds,
      widgetFilterFieldMetadataIds,
      expectedFieldName,
    ) => {
      expect(
        buildDashboardFilter({
          groupByFieldMetadataIds,
          widgetFilterFieldMetadataIds,
          dashboardFilterValues: periodValue(
            ViewFilterOperand.IS_BEFORE,
            '2026-01-01',
          ),
        }),
      ).toHaveProperty([expectedFieldName]);
    },
  );

  // Wire contract: an inclusive day range is IS_AFTER its first day and IS_BEFORE the day after its last
  it.each([
    [
      'DATE',
      CLOSE_DATE_FIELD.id,
      {
        and: [
          { closeDate: { gte: '2026-03-01' } },
          { closeDate: { lt: '2026-04-01' } },
        ],
      },
    ],
    [
      'DATE_TIME',
      CREATED_AT_FIELD.id,
      {
        and: [
          { createdAt: { gte: '2026-02-28T23:00:00Z' } },
          { createdAt: { lt: '2026-03-31T22:00:00Z' } },
        ],
      },
    ],
  ])(
    'should include the first day and exclude the day after a range on a %s field',
    (_fieldType, fieldMetadataId, expectedFilter) => {
      expect(
        buildFilterBoundTo({
          fieldMetadataId,
          dashboardFilterValues: [
            {
              pageLayoutFilterId: PERIOD_FILTER_ID,
              type: PageLayoutFilterType.DATE,
              conditions: [
                { operand: ViewFilterOperand.IS_AFTER, value: '2026-03-01' },
                { operand: ViewFilterOperand.IS_BEFORE, value: '2026-04-01' },
              ],
            },
          ],
        }),
      ).toEqual(expectedFilter);
    },
  );

  it('should leave a widget unfiltered when the filter is not applied to it', () => {
    expect(
      buildFilterBoundTo({
        fieldMetadataId: null,
        dashboardFilterValues: periodValue(
          ViewFilterOperand.IS_AFTER,
          '2026-01-01',
        ),
      }),
    ).toEqual({});
  });

  it('should leave a widget unfiltered when its object has no date to infer', () => {
    expect(
      buildDashboardFilter({
        flatObjectMetadata: {
          ...OPPORTUNITY_OBJECT,
          fieldIds: [NAME_FIELD.id],
        },
        dashboardFilterValues: periodValue(
          ViewFilterOperand.IS_AFTER,
          '2026-01-01',
        ),
      }),
    ).toEqual({});
  });

  it('should not validate a binding whose filter has no value', () => {
    expect(
      buildFilterBoundTo({
        fieldMetadataId: COMPANY_CREATED_AT_FIELD.id,
        dashboardFilterValues: [],
      }),
    ).toEqual({});
  });

  it("should start relative weeks on the widget's first day of the week", () => {
    expect(
      buildFilterBoundTo({
        fieldMetadataId: CREATED_AT_FIELD.id,
        dashboardFilterValues: periodValue(
          ViewFilterOperand.IS_RELATIVE,
          'PAST_2_WEEK',
        ),
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
      }),
    ).toEqual(
      convertChartFilterToGqlOperationFilter({
        filter: {
          recordFilters: [
            {
              fieldMetadataId: CREATED_AT_FIELD.id,
              operand: ViewFilterOperand.IS_RELATIVE,
              value: `PAST_2_WEEK;;${VIEWER_TIME_ZONE};;SUNDAY;;`,
            },
          ],
        },
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
        userTimezone: VIEWER_TIME_ZONE,
      }),
    );
  });

  it.each<RejectedBindingCase>([
    [
      'a field of another object',
      COMPANY_CREATED_AT_FIELD.id,
      periodValue(ViewFilterOperand.IS_AFTER, '2026-01-01'),
      "which is not a field of the widget's object",
    ],
    [
      'a field that does not exist',
      'missing-field-id',
      periodValue(ViewFilterOperand.IS_AFTER, '2026-01-01'),
      "which is not a field of the widget's object",
    ],
    [
      'a field that cannot be bound to a dashboard filter',
      NAME_FIELD.id,
      periodValue(ViewFilterOperand.IS_AFTER, '2026-01-01'),
      'cannot be bound to a dashboard filter',
    ],
    [
      'the soft-delete field, which would include deleted records',
      DELETED_AT_FIELD.id,
      periodValue(ViewFilterOperand.IS_AFTER, '2026-01-01'),
      'cannot be bound to a dashboard filter',
    ],
    [
      'a disallowed operand',
      CREATED_AT_FIELD.id,
      periodValue(ViewFilterOperand.CONTAINS, '2026'),
      'operand "CONTAINS" of filter',
    ],
    [
      'a date time instead of a plain date',
      CREATED_AT_FIELD.id,
      periodValue(ViewFilterOperand.IS_AFTER, '2026-01-01T00:00:00Z'),
      'is not valid for operand "IS_AFTER"',
    ],
    [
      'an empty value',
      CREATED_AT_FIELD.id,
      periodValue(ViewFilterOperand.IS_BEFORE, ''),
      'is not valid for operand "IS_BEFORE"',
    ],
    [
      'an unparsable relative date',
      CREATED_AT_FIELD.id,
      periodValue(ViewFilterOperand.IS_RELATIVE, 'LAST_MONTH'),
      'is not valid for operand "IS_RELATIVE"',
    ],
    [
      'a relative date too far away for a DATE field',
      CLOSE_DATE_FIELD.id,
      periodValue(ViewFilterOperand.IS_RELATIVE, 'PAST_5000_YEAR'),
      'Expected a relative date amount of at most 1000',
    ],
    [
      'a relative date too far away for a DATE_TIME field',
      CREATED_AT_FIELD.id,
      periodValue(ViewFilterOperand.IS_RELATIVE, 'PAST_999999_YEAR'),
      'Expected a relative date amount of at most 1000',
    ],
    ...['PAST_1000_SECOND', 'NEXT_2_MINUTE', 'THIS_1_HOUR'].map(
      (value): RejectedBindingCase => [
        `the sub-day relative date ${value} on a DATE field`,
        CLOSE_DATE_FIELD.id,
        periodValue(ViewFilterOperand.IS_RELATIVE, value),
        'Expected a relative date unit of a day or longer',
      ],
    ),
    ...[
      '2026-01-01T10:00',
      '2026-01-01[u-ca=hebrew]',
      '+012026-01-01',
      '0000-01-01',
      '20260101',
    ].map((value): RejectedBindingCase => [
      `the lenient date ${value} on a DATE field`,
      CLOSE_DATE_FIELD.id,
      periodValue(ViewFilterOperand.IS_AFTER, value),
      'Expected a YYYY-MM-DD date',
    ]),
    [
      'the lenient date 2026-01-01T10:00 on a DATE_TIME field',
      CREATED_AT_FIELD.id,
      periodValue(ViewFilterOperand.IS_AFTER, '2026-01-01T10:00'),
      'Expected a YYYY-MM-DD date',
    ],
    [
      'a date out of range in the viewer time zone',
      CREATED_AT_FIELD.id,
      periodValue(ViewFilterOperand.IS_AFTER, '0001-01-01'),
      'Dashboard filter date "0001-01-01" is out of range',
    ],
  ])(
    'should reject a binding to %s',
    (_, fieldMetadataId, dashboardFilterValues, expectedMessage) => {
      expect(
        catchChartDataException(() =>
          buildFilterBoundTo({ fieldMetadataId, dashboardFilterValues }),
        ),
      ).toMatchObject({
        code: ChartDataExceptionCode.INVALID_DASHBOARD_FILTER,
        message: expect.stringContaining(expectedMessage),
      });
    },
  );

  it('should let an unexpected converter failure through instead of blaming the filter', () => {
    jest
      .mocked(convertChartFilterToGqlOperationFilter)
      .mockImplementationOnce(() => {
        throw new TypeError('Cannot read properties of undefined');
      });

    expect(() =>
      buildFilterBoundTo({
        fieldMetadataId: CREATED_AT_FIELD.id,
        dashboardFilterValues: periodValue(
          ViewFilterOperand.IS_AFTER,
          '2026-01-01',
        ),
      }),
    ).toThrow(TypeError);
  });

  it.each([
    ['an empty time zone', ''],
    ['a time zone Temporal does not know', 'Mars/Olympus_Mons'],
  ])('should reject values sent with %s', (_, timeZone) => {
    expect(
      catchChartDataException(() =>
        buildFilterBoundTo({
          fieldMetadataId: CREATED_AT_FIELD.id,
          dashboardFilterValues: periodValue(
            ViewFilterOperand.IS_AFTER,
            '2026-01-01',
          ),
          timeZone,
        }),
      ),
    ).toMatchObject({
      code: ChartDataExceptionCode.INVALID_DASHBOARD_FILTER,
    });
  });

  describe('with the widget filter', () => {
    const closeDateCondition = (
      operand: ViewFilterOperand,
      value: string,
      recordFilterGroupId?: string,
    ) => ({
      fieldMetadataId: CLOSE_DATE_FIELD.id,
      operand,
      value,
      recordFilterGroupId,
    });
    const NAME_CONDITION = {
      fieldMetadataId: NAME_FIELD.id,
      operand: ViewFilterOperand.CONTAINS,
      value: 'Acme',
    };
    const convert = (filter: ChartFilter) =>
      convertChartFilterToGqlOperationFilter({
        filter,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
        userTimezone: VIEWER_TIME_ZONE,
      });
    const JANUARY_ON_CLOSE_DATE = buildDashboardFilter({
      dashboardFilterValues: periodValue(
        ViewFilterOperand.IS_RELATIVE,
        'THIS_1_MONTH',
      ),
      widgetFilterFieldMetadataIds: [CLOSE_DATE_FIELD.id],
    });

    it('should leave out its period on the field and keep its other conditions', () => {
      expect(
        buildDashboardFilter({
          widgetFilter: {
            recordFilters: [
              closeDateCondition(
                ViewFilterOperand.IS_RELATIVE,
                'THIS_1_QUARTER',
              ),
              NAME_CONDITION,
            ],
          },
          dashboardFilterValues: periodValue(
            ViewFilterOperand.IS_RELATIVE,
            'THIS_1_MONTH',
          ),
          widgetFilterFieldMetadataIds: [CLOSE_DATE_FIELD.id, NAME_FIELD.id],
        }),
      ).toEqual({
        and: [
          convert({ recordFilters: [NAME_CONDITION] }),
          JANUARY_ON_CLOSE_DATE,
        ],
      });
    });

    it('should keep a non-period condition on the field', () => {
      const inThePast = closeDateCondition(ViewFilterOperand.IS_IN_PAST, '');

      expect(
        buildDashboardFilter({
          widgetFilter: { recordFilters: [inThePast] },
          dashboardFilterValues: periodValue(
            ViewFilterOperand.IS_RELATIVE,
            'THIS_1_MONTH',
          ),
          widgetFilterFieldMetadataIds: [CLOSE_DATE_FIELD.id],
        }),
      ).toEqual({
        and: [convert({ recordFilters: [inThePast] }), JANUARY_ON_CLOSE_DATE],
      });
    });

    it('should keep a period inside a nested group', () => {
      const widgetFilter = {
        recordFilters: [
          closeDateCondition(
            ViewFilterOperand.IS_RELATIVE,
            'THIS_1_QUARTER',
            'nested',
          ),
        ],
        recordFilterGroups: [
          { id: 'root', logicalOperator: RecordFilterGroupLogicalOperator.AND },
          {
            id: 'nested',
            logicalOperator: RecordFilterGroupLogicalOperator.OR,
            parentRecordFilterGroupId: 'root',
          },
        ],
      };

      expect(
        buildDashboardFilter({
          widgetFilter,
          dashboardFilterValues: periodValue(
            ViewFilterOperand.IS_RELATIVE,
            'THIS_1_MONTH',
          ),
          widgetFilterFieldMetadataIds: [CLOSE_DATE_FIELD.id],
        }),
      ).toEqual({ and: [convert(widgetFilter), JANUARY_ON_CLOSE_DATE] });
    });

    it('should keep its period without a value or on an ignoring widget', () => {
      const widgetFilter = {
        recordFilters: [
          closeDateCondition(ViewFilterOperand.IS_RELATIVE, 'THIS_1_QUARTER'),
        ],
      };

      expect(
        buildDashboardFilter({ widgetFilter, dashboardFilterValues: [] }),
      ).toEqual(convert(widgetFilter));
      expect(
        buildFilterBoundTo({
          fieldMetadataId: null,
          widgetFilter,
          dashboardFilterValues: periodValue(
            ViewFilterOperand.IS_RELATIVE,
            'THIS_1_MONTH',
          ),
          widgetFilterFieldMetadataIds: [CLOSE_DATE_FIELD.id],
        }),
      ).toEqual(convert(widgetFilter));
    });
  });
});
