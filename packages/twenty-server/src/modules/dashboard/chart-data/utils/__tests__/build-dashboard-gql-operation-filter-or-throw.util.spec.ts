import { CalendarStartDay } from 'twenty-shared/constants';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import {
  ChartDataException,
  ChartDataExceptionCode,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';
import { buildDashboardGqlOperationFilterOrThrow } from 'src/modules/dashboard/chart-data/utils/build-dashboard-gql-operation-filter-or-throw.util';
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
const UNBOUND_FILTER_ID = '6b2f0c3e-91a7-4f08-8d3e-5a7c2e9b4d22';
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

const periodValue = (operand: ViewFilterOperand, value: string) => [
  { pageLayoutFilterId: PERIOD_FILTER_ID, conditions: [{ operand, value }] },
];

const buildFilterBoundTo = ({
  fieldMetadataId,
  dashboardFilterValues,
  viewerTimeZone = VIEWER_TIME_ZONE,
  firstDayOfTheWeek = CalendarStartDay.MONDAY,
}: {
  fieldMetadataId: string;
  dashboardFilterValues: ReturnType<typeof periodValue> | null;
  viewerTimeZone?: string | null;
  firstDayOfTheWeek?: CalendarStartDay;
}) =>
  buildDashboardGqlOperationFilterOrThrow({
    dashboardFilterValues,
    viewerTimeZone,
    dashboardFilterBindings: [
      { pageLayoutFilterId: PERIOD_FILTER_ID, fieldMetadataId },
    ],
    firstDayOfTheWeek,
    objectMetadataId: OPPORTUNITY_OBJECT_ID,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  });

type RejectedBindingCase = [
  string,
  string,
  ReturnType<typeof periodValue>,
  string,
];

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

describe('buildDashboardGqlOperationFilterOrThrow', () => {
  it('should return an empty filter when the request has no dashboard filter values', () => {
    expect(
      buildFilterBoundTo({
        fieldMetadataId: CREATED_AT_FIELD.id,
        dashboardFilterValues: null,
      }),
    ).toEqual({});
  });

  it('should filter the bound field in the given time zone and ignore unbound values', () => {
    expect(
      buildFilterBoundTo({
        fieldMetadataId: CREATED_AT_FIELD.id,
        dashboardFilterValues: [
          ...periodValue(ViewFilterOperand.IS_AFTER, '2026-01-01'),
          {
            pageLayoutFilterId: UNBOUND_FILTER_ID,
            conditions: [{ operand: ViewFilterOperand.IS_EMPTY, value: '' }],
          },
        ],
      }),
    ).toEqual({ createdAt: { gte: '2025-12-31T23:00:00Z' } });
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
    ['no time zone', null],
    ['a time zone Temporal does not know', 'Mars/Olympus_Mons'],
  ])('should reject values sent with %s', (_, viewerTimeZone) => {
    expect(
      catchChartDataException(() =>
        buildFilterBoundTo({
          fieldMetadataId: CREATED_AT_FIELD.id,
          dashboardFilterValues: periodValue(
            ViewFilterOperand.IS_AFTER,
            '2026-01-01',
          ),
          viewerTimeZone,
        }),
      ),
    ).toMatchObject({
      code: ChartDataExceptionCode.INVALID_DASHBOARD_FILTER,
    });
  });
});
