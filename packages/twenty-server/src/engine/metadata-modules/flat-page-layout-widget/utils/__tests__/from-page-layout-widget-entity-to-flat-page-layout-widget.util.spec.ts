import { AggregateOperations, WidgetType } from 'twenty-shared/types';

import { fromPageLayoutWidgetEntityToFlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-entity-to-flat-page-layout-widget.util';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

const APPLICATION_ID = '00000000-0000-4000-8000-000000000001';
const PAGE_LAYOUT_TAB_ID = '00000000-0000-4000-8000-000000000002';
const COMPANY_OBJECT_METADATA_ID = '00000000-0000-4000-8000-000000000003';
const AGGREGATE_FIELD_ID = '00000000-0000-4000-8000-000000000004';
const CREATED_AT_FIELD_ID = '00000000-0000-4000-8000-000000000005';
const DELETED_FIELD_ID = '00000000-0000-4000-8000-000000000006';
const CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-000000000005';
const PERIOD_FILTER_ID = '00000000-0000-4000-8000-000000000007';
const CLOSE_DATE_FILTER_ID = '00000000-0000-4000-8000-000000000008';
const ANNIVERSARY_FILTER_ID = '00000000-0000-4000-8000-000000000009';

const VALID_OVERRIDE = {
  pageLayoutFilterId: PERIOD_FILTER_ID,
  fieldMetadataId: CREATED_AT_FIELD_ID,
};
const EXCLUSION = {
  pageLayoutFilterId: CLOSE_DATE_FILTER_ID,
  fieldMetadataId: null,
};
const STALE_OVERRIDE = {
  pageLayoutFilterId: ANNIVERSARY_FILTER_ID,
  fieldMetadataId: DELETED_FIELD_ID,
};

const convert = (configuration: PageLayoutWidgetEntity['configuration']) =>
  fromPageLayoutWidgetEntityToFlatPageLayoutWidget({
    entity: Object.assign(new PageLayoutWidgetEntity(), {
      id: '00000000-0000-4000-8000-000000000010',
      universalIdentifier: '20202020-0000-4000-8000-000000000010',
      workspaceId: '00000000-0000-4000-8000-000000000011',
      applicationId: APPLICATION_ID,
      pageLayoutTabId: PAGE_LAYOUT_TAB_ID,
      title: 'Companies',
      type: WidgetType.GRAPH,
      objectMetadataId: COMPANY_OBJECT_METADATA_ID,
      conditionalDisplay: null,
      conditionalAvailabilityExpression: null,
      position: null,
      configuration,
      overrides: null,
      isSystemSideEffect: false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      deletedAt: null,
    }),
    applicationIdToUniversalIdentifierMap: new Map([
      [APPLICATION_ID, '20202020-0000-4000-8000-000000000001'],
    ]),
    pageLayoutTabIdToUniversalIdentifierMap: new Map([
      [PAGE_LAYOUT_TAB_ID, '20202020-0000-4000-8000-000000000002'],
    ]),
    objectMetadataIdToUniversalIdentifierMap: new Map([
      [COMPANY_OBJECT_METADATA_ID, '20202020-0000-4000-8000-000000000003'],
    ]),
    fieldMetadataUniversalIdentifierById: {
      [AGGREGATE_FIELD_ID]: '20202020-0000-4000-8000-000000000004',
      [CREATED_AT_FIELD_ID]: CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
    },
    pageLayoutTabUniversalIdentifierById: {
      [PAGE_LAYOUT_TAB_ID]: '20202020-0000-4000-8000-000000000002',
    },
  });

describe('fromPageLayoutWidgetEntityToFlatPageLayoutWidget', () => {
  it('should drop an override whose field no longer exists and keep the other bindings', () => {
    const flatPageLayoutWidget = convert({
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateFieldMetadataId: AGGREGATE_FIELD_ID,
      aggregateOperation: AggregateOperations.SUM,
      dashboardFilterBindings: [VALID_OVERRIDE, STALE_OVERRIDE, EXCLUSION],
    });

    expect(flatPageLayoutWidget.configuration).toMatchObject({
      dashboardFilterBindings: [VALID_OVERRIDE, EXCLUSION],
    });
    expect(flatPageLayoutWidget.universalConfiguration).toMatchObject({
      dashboardFilterBindings: [
        {
          pageLayoutFilterId: PERIOD_FILTER_ID,
          fieldMetadataUniversalIdentifier:
            CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
        },
        {
          pageLayoutFilterId: CLOSE_DATE_FILTER_ID,
          fieldMetadataUniversalIdentifier: null,
        },
      ],
    });
  });

  it('should keep a configuration without bindings as stored', () => {
    const configuration: PageLayoutWidgetEntity['configuration'] = {
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateFieldMetadataId: AGGREGATE_FIELD_ID,
      aggregateOperation: AggregateOperations.SUM,
    };

    expect(convert(configuration).configuration).toEqual(configuration);
  });
});
