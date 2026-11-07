import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import {
  ChartDataException,
  ChartDataExceptionCode,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';
import { buildDashboardChartFilterOrThrow } from 'src/modules/dashboard/chart-data/utils/build-dashboard-chart-filter-or-throw.util';

const OPPORTUNITY_OBJECT_ID = 'opportunity-object-id';
const PERIOD_FILTER_ID = '1d5ec6d4-7e43-4a5c-9b1b-2d4f8a0e3c11';
const UNBOUND_FILTER_ID = '6b2f0c3e-91a7-4f08-8d3e-5a7c2e9b4d22';

const CREATED_AT_FIELD = getFlatFieldMetadataMock({
  id: 'created-at-field-id',
  name: 'createdAt',
  universalIdentifier: 'created-at-universal-id',
  objectMetadataId: OPPORTUNITY_OBJECT_ID,
  type: FieldMetadataType.DATE_TIME,
});

const NAME_FIELD = getFlatFieldMetadataMock({
  id: 'name-field-id',
  name: 'name',
  universalIdentifier: 'name-universal-id',
  objectMetadataId: OPPORTUNITY_OBJECT_ID,
  type: FieldMetadataType.TEXT,
});

const COMPANY_CREATED_AT_FIELD = getFlatFieldMetadataMock({
  id: 'company-created-at-field-id',
  name: 'createdAt',
  universalIdentifier: 'company-created-at-universal-id',
  objectMetadataId: 'company-object-id',
  type: FieldMetadataType.DATE_TIME,
});

const flatFieldMetadataMaps = addAllFlatEntitiesToFlatEntityMaps({
  flatEntities: [CREATED_AT_FIELD, NAME_FIELD, COMPANY_CREATED_AT_FIELD],
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const buildFilterBoundTo = ({
  fieldMetadataId,
  dashboardFilterValues,
  timeZone = 'Europe/Paris',
}: {
  fieldMetadataId: string;
  dashboardFilterValues: unknown;
  timeZone?: string;
}) =>
  buildDashboardChartFilterOrThrow({
    dashboardFilterValues,
    dashboardFilterBindings: [
      { pageLayoutFilterId: PERIOD_FILTER_ID, fieldMetadataId },
    ],
    timeZone,
    objectMetadataId: OPPORTUNITY_OBJECT_ID,
    flatFieldMetadataMaps,
  });

const periodValue = (operand: string, value: string) => ({
  [PERIOD_FILTER_ID]: { conditions: [{ operand, value }] },
});

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

describe('buildDashboardChartFilterOrThrow', () => {
  it('should return no filter when the request has no dashboard filter values', () => {
    expect(
      buildFilterBoundTo({
        fieldMetadataId: CREATED_AT_FIELD.id,
        dashboardFilterValues: null,
      }),
    ).toBeUndefined();
  });

  it('should filter the bound field in the given time zone and ignore unbound values', () => {
    expect(
      buildFilterBoundTo({
        fieldMetadataId: CREATED_AT_FIELD.id,
        dashboardFilterValues: {
          ...periodValue(ViewFilterOperand.IS_AFTER, '2026-01-01'),
          [UNBOUND_FILTER_ID]: {
            conditions: [{ operand: ViewFilterOperand.IS_EMPTY, value: '' }],
          },
        },
      }),
    ).toEqual({
      recordFilters: [
        {
          fieldMetadataId: CREATED_AT_FIELD.id,
          operand: ViewFilterOperand.IS_AFTER,
          value: '2025-12-31T23:00:00Z',
        },
      ],
    });
  });

  it('should not validate a binding whose filter has no value', () => {
    expect(
      buildFilterBoundTo({
        fieldMetadataId: COMPANY_CREATED_AT_FIELD.id,
        dashboardFilterValues: {},
      }),
    ).toEqual({ recordFilters: [] });
  });

  it.each([
    ['a string', 'last month'],
    ['an array', [{ operand: ViewFilterOperand.IS_AFTER }]],
    ['a value without conditions', { [PERIOD_FILTER_ID]: {} }],
    [
      'an unknown operand',
      {
        [PERIOD_FILTER_ID]: { conditions: [{ operand: 'BETWEEN', value: '' }] },
      },
    ],
    [
      'a relative date object instead of its serialization',
      {
        [PERIOD_FILTER_ID]: {
          conditions: [
            {
              operand: ViewFilterOperand.IS_RELATIVE,
              value: { direction: 'PAST', amount: 1, unit: 'MONTH' },
            },
          ],
        },
      },
    ],
  ])('should reject values that are %s', (_, dashboardFilterValues) => {
    expect(
      catchChartDataException(() =>
        buildFilterBoundTo({
          fieldMetadataId: CREATED_AT_FIELD.id,
          dashboardFilterValues,
        }),
      ),
    ).toMatchObject({
      code: ChartDataExceptionCode.INVALID_DASHBOARD_FILTER,
      message: expect.stringContaining('values are malformed'),
    });
  });

  it.each([
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

  it('should reject an invalid time zone', () => {
    expect(
      catchChartDataException(() =>
        buildFilterBoundTo({
          fieldMetadataId: CREATED_AT_FIELD.id,
          dashboardFilterValues: periodValue(
            ViewFilterOperand.IS_AFTER,
            '2026-01-01',
          ),
          timeZone: 'Mars/Olympus_Mons',
        }),
      ),
    ).toMatchObject({
      code: ChartDataExceptionCode.INVALID_DASHBOARD_FILTER,
      message: expect.stringContaining('is not a valid IANA time zone'),
    });
  });
});
