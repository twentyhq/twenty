import {
  AggregateOperations,
  FieldMetadataType,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { computeFlatPageLayoutWidgetsUnboundFromDeletedFields } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/compute-flat-page-layout-widgets-unbound-from-deleted-fields.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

const DELETED_FIELD = {
  id: '11111111-1111-4111-8111-111111111111',
  universalIdentifier: '11111111-1111-4111-8111-aaaaaaaaaaaa',
};
const KEPT_FIELD = {
  id: '22222222-2222-4222-8222-222222222222',
  universalIdentifier: '22222222-2222-4222-8222-aaaaaaaaaaaa',
};
const AGGREGATE_FIELD = {
  id: '33333333-3333-4333-8333-333333333333',
  universalIdentifier: '33333333-3333-4333-8333-aaaaaaaaaaaa',
};
const PREVIOUSLY_DELETED_FIELD_ID = '44444444-4444-4444-8444-444444444444';
const PERIOD_FILTER_ID = '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e01';
const CLOSE_DATE_FILTER_ID = '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e02';

const FLAT_FIELD_METADATA_MAPS = {
  universalIdentifierById: Object.fromEntries(
    [DELETED_FIELD, KEPT_FIELD, AGGREGATE_FIELD].map(
      ({ id, universalIdentifier }) => [id, universalIdentifier],
    ),
  ),
  byUniversalIdentifier: Object.fromEntries(
    [DELETED_FIELD, KEPT_FIELD, AGGREGATE_FIELD].map((field) => [
      field.universalIdentifier,
      getFlatFieldMetadataMock({
        ...field,
        objectMetadataId: 'object-metadata-id',
        type: FieldMetadataType.DATE,
      }),
    ]),
  ),
};

type BoundWidget = Pick<
  FlatPageLayoutWidget,
  'deletedAt' | 'configuration' | 'universalConfiguration'
>;

const computeUnboundWidgets = (flatPageLayoutWidgets: BoundWidget[]) =>
  computeFlatPageLayoutWidgetsUnboundFromDeletedFields({
    flatPageLayoutWidgets,
    deletedFieldIds: new Set([DELETED_FIELD.id]),
    flatFieldMetadataMaps: FLAT_FIELD_METADATA_MAPS,
  });

const buildRecordTableWidget = (
  boundFields: { id: string; universalIdentifier: string }[],
): BoundWidget => ({
  deletedAt: null,
  configuration: {
    configurationType: WidgetConfigurationType.RECORD_TABLE,
    viewId: 'view-id',
    dashboardFilterBindings: boundFields.map(({ id }, index) => ({
      pageLayoutFilterId: index === 0 ? PERIOD_FILTER_ID : CLOSE_DATE_FILTER_ID,
      fieldMetadataId: id,
    })),
  },
  universalConfiguration: {
    configurationType: WidgetConfigurationType.RECORD_TABLE,
    viewUniversalIdentifier: 'view-universal-identifier',
    dashboardFilterBindings: boundFields.map(
      ({ universalIdentifier }, index) => ({
        pageLayoutFilterId:
          index === 0 ? PERIOD_FILTER_ID : CLOSE_DATE_FILTER_ID,
        fieldMetadataUniversalIdentifier: universalIdentifier,
      }),
    ),
  },
});

const buildAggregateChartWidget = ({
  aggregateField = AGGREGATE_FIELD,
  filteredFieldIds,
}: {
  aggregateField?: { id: string; universalIdentifier: string };
  filteredFieldIds: string[];
}): BoundWidget => ({
  deletedAt: null,
  configuration: {
    configurationType: WidgetConfigurationType.AGGREGATE_CHART,
    aggregateFieldMetadataId: aggregateField.id,
    aggregateOperation: AggregateOperations.MAX,
    filter: {
      recordFilters: filteredFieldIds.map((fieldMetadataId) => ({
        fieldMetadataId,
        operand: ViewFilterOperand.IS_NOT_EMPTY,
      })),
    },
    dashboardFilterBindings: [
      {
        pageLayoutFilterId: PERIOD_FILTER_ID,
        fieldMetadataId: DELETED_FIELD.id,
      },
    ],
  },
  universalConfiguration: {
    configurationType: WidgetConfigurationType.AGGREGATE_CHART,
    aggregateFieldMetadataUniversalIdentifier:
      aggregateField.universalIdentifier,
    aggregateOperation: AggregateOperations.MAX,
    filter: {
      recordFilters: filteredFieldIds.map((fieldMetadataId) => ({
        fieldMetadataUniversalIdentifier:
          FLAT_FIELD_METADATA_MAPS.universalIdentifierById[fieldMetadataId] ??
          null,
        operand: ViewFilterOperand.IS_NOT_EMPTY,
      })),
    },
    dashboardFilterBindings: [
      {
        pageLayoutFilterId: PERIOD_FILTER_ID,
        fieldMetadataUniversalIdentifier: DELETED_FIELD.universalIdentifier,
      },
    ],
  },
});

describe('computeFlatPageLayoutWidgetsUnboundFromDeletedFields', () => {
  it('should drop the bindings to deleted fields and keep the others', () => {
    expect(
      computeUnboundWidgets([
        buildRecordTableWidget([DELETED_FIELD, KEPT_FIELD]),
      ]),
    ).toEqual([
      {
        deletedAt: null,
        configuration: {
          configurationType: WidgetConfigurationType.RECORD_TABLE,
          viewId: 'view-id',
          dashboardFilterBindings: [
            {
              pageLayoutFilterId: CLOSE_DATE_FILTER_ID,
              fieldMetadataId: KEPT_FIELD.id,
            },
          ],
        },
        universalConfiguration: {
          configurationType: WidgetConfigurationType.RECORD_TABLE,
          viewUniversalIdentifier: 'view-universal-identifier',
          dashboardFilterBindings: [
            {
              pageLayoutFilterId: CLOSE_DATE_FILTER_ID,
              fieldMetadataUniversalIdentifier: KEPT_FIELD.universalIdentifier,
            },
          ],
        },
      },
    ]);
  });

  it('should keep the exclusions of a widget it unbinds from a deleted field', () => {
    const notAppliedBinding = {
      pageLayoutFilterId: CLOSE_DATE_FILTER_ID,
      fieldMetadataId: null,
    };
    const universalNotAppliedBinding = {
      pageLayoutFilterId: CLOSE_DATE_FILTER_ID,
      fieldMetadataUniversalIdentifier: null,
    };

    expect(
      computeUnboundWidgets([
        {
          deletedAt: null,
          configuration: {
            configurationType: WidgetConfigurationType.RECORD_TABLE,
            dashboardFilterBindings: [
              {
                pageLayoutFilterId: PERIOD_FILTER_ID,
                fieldMetadataId: DELETED_FIELD.id,
              },
              notAppliedBinding,
            ],
          },
          universalConfiguration: {
            configurationType: WidgetConfigurationType.RECORD_TABLE,
            dashboardFilterBindings: [
              {
                pageLayoutFilterId: PERIOD_FILTER_ID,
                fieldMetadataUniversalIdentifier:
                  DELETED_FIELD.universalIdentifier,
              },
              universalNotAppliedBinding,
            ],
          },
        },
      ]),
    ).toMatchObject([
      {
        configuration: { dashboardFilterBindings: [notAppliedBinding] },
        universalConfiguration: {
          dashboardFilterBindings: [universalNotAppliedBinding],
        },
      },
    ]);
  });

  it('should drop a stale override on both sides even when its universal side reads as an exclusion', () => {
    expect(
      computeUnboundWidgets([
        {
          deletedAt: null,
          configuration: {
            configurationType: WidgetConfigurationType.RECORD_TABLE,
            dashboardFilterBindings: [
              {
                pageLayoutFilterId: PERIOD_FILTER_ID,
                fieldMetadataId: DELETED_FIELD.id,
              },
              {
                pageLayoutFilterId: CLOSE_DATE_FILTER_ID,
                fieldMetadataId: PREVIOUSLY_DELETED_FIELD_ID,
              },
            ],
          },
          universalConfiguration: {
            configurationType: WidgetConfigurationType.RECORD_TABLE,
            dashboardFilterBindings: [
              {
                pageLayoutFilterId: PERIOD_FILTER_ID,
                fieldMetadataUniversalIdentifier:
                  DELETED_FIELD.universalIdentifier,
              },
              {
                pageLayoutFilterId: CLOSE_DATE_FILTER_ID,
                fieldMetadataUniversalIdentifier: null,
              },
            ],
          },
        },
      ]),
    ).toMatchObject([
      {
        configuration: { dashboardFilterBindings: [] },
        universalConfiguration: { dashboardFilterBindings: [] },
      },
    ]);
  });

  it('should leave out widgets that bind no deleted field', () => {
    expect(
      computeUnboundWidgets([
        buildRecordTableWidget([KEPT_FIELD]),
        buildRecordTableWidget([]),
      ]),
    ).toEqual([]);
  });

  it('should leave out deleted widgets', () => {
    expect(
      computeUnboundWidgets([
        {
          ...buildRecordTableWidget([DELETED_FIELD]),
          deletedAt: '2026-01-01T00:00:00.000Z',
        },
      ]),
    ).toEqual([]);
  });

  it('should leave out widgets whose configuration cannot hold bindings', () => {
    expect(
      computeUnboundWidgets([
        {
          deletedAt: null,
          configuration: {
            configurationType: WidgetConfigurationType.IFRAME,
            url: 'https://twenty.com',
          },
          universalConfiguration: {
            configurationType: WidgetConfigurationType.IFRAME,
            url: 'https://twenty.com',
          },
        },
      ]),
    ).toEqual([]);
  });

  it('should drop the chart filters on the deleted field it binds, and those that no longer resolve', () => {
    const [unboundWidget, ...otherUnboundWidgets] = computeUnboundWidgets([
      buildAggregateChartWidget({
        filteredFieldIds: [
          DELETED_FIELD.id,
          PREVIOUSLY_DELETED_FIELD_ID,
          KEPT_FIELD.id,
        ],
      }),
    ]);

    expect(otherUnboundWidgets).toEqual([]);
    expect(unboundWidget.configuration).toMatchObject({
      filter: {
        recordFilters: [{ fieldMetadataId: KEPT_FIELD.id }],
      },
      dashboardFilterBindings: [],
    });
    expect(unboundWidget.universalConfiguration).toMatchObject({
      filter: {
        recordFilters: [
          { fieldMetadataUniversalIdentifier: KEPT_FIELD.universalIdentifier },
        ],
      },
      dashboardFilterBindings: [],
    });
  });

  it('should leave out widgets that aggregate a deleted field', () => {
    expect(
      computeUnboundWidgets([
        buildAggregateChartWidget({
          aggregateField: DELETED_FIELD,
          filteredFieldIds: [],
        }),
      ]),
    ).toEqual([]);
  });
});
