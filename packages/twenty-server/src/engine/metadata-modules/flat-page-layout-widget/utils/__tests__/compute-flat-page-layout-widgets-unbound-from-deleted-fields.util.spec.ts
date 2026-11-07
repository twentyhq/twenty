import { AggregateOperations } from 'twenty-shared/types';

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
const PERIOD_FILTER_ID = '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e01';
const CLOSE_DATE_FILTER_ID = '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e02';

const buildRecordTableWidget = (
  boundFields: { id: string; universalIdentifier: string }[],
): Pick<
  FlatPageLayoutWidget<WidgetConfigurationType.RECORD_TABLE>,
  'id' | 'configuration' | 'universalConfiguration'
> => ({
  id: 'widget-id',
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

describe('computeFlatPageLayoutWidgetsUnboundFromDeletedFields', () => {
  it('should drop the bindings to deleted fields and keep the others', () => {
    const [updatedWidget, ...otherUpdatedWidgets] =
      computeFlatPageLayoutWidgetsUnboundFromDeletedFields({
        flatPageLayoutWidgets: [
          buildRecordTableWidget([DELETED_FIELD, KEPT_FIELD]),
        ],
        deletedFlatFieldMetadatas: [DELETED_FIELD],
      });

    expect(otherUpdatedWidgets).toEqual([]);
    expect(updatedWidget).toEqual({
      id: 'widget-id',
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
    });
  });

  it('should leave out widgets that bind no deleted field', () => {
    expect(
      computeFlatPageLayoutWidgetsUnboundFromDeletedFields({
        flatPageLayoutWidgets: [
          buildRecordTableWidget([KEPT_FIELD]),
          buildRecordTableWidget([]),
        ],
        deletedFlatFieldMetadatas: [DELETED_FIELD],
      }),
    ).toEqual([]);
  });

  it('should leave out widgets whose configuration cannot hold bindings', () => {
    expect(
      computeFlatPageLayoutWidgetsUnboundFromDeletedFields({
        flatPageLayoutWidgets: [
          {
            configuration: {
              configurationType: WidgetConfigurationType.IFRAME,
              url: 'https://twenty.com',
            },
            universalConfiguration: {
              configurationType: WidgetConfigurationType.IFRAME,
              url: 'https://twenty.com',
            },
          },
        ],
        deletedFlatFieldMetadatas: [DELETED_FIELD],
      }),
    ).toEqual([]);
  });

  it('should leave out widgets that still reference a deleted field elsewhere', () => {
    const chartWidget: Pick<
      FlatPageLayoutWidget<WidgetConfigurationType.AGGREGATE_CHART>,
      'configuration' | 'universalConfiguration'
    > = {
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: DELETED_FIELD.id,
        aggregateOperation: AggregateOperations.MAX,
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
          DELETED_FIELD.universalIdentifier,
        aggregateOperation: AggregateOperations.MAX,
        dashboardFilterBindings: [
          {
            pageLayoutFilterId: PERIOD_FILTER_ID,
            fieldMetadataUniversalIdentifier: DELETED_FIELD.universalIdentifier,
          },
        ],
      },
    };

    expect(
      computeFlatPageLayoutWidgetsUnboundFromDeletedFields({
        flatPageLayoutWidgets: [chartWidget],
        deletedFlatFieldMetadatas: [DELETED_FIELD],
      }),
    ).toEqual([]);
  });
});
