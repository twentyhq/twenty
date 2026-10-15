import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import {
  fetchTestFieldMetadataIds,
  type TestFieldMetadataIds,
} from 'test/integration/metadata/suites/page-layout-widget/utils/fetch-test-field-metadata-ids.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { updateOnePageLayoutWithTabsAndWidgets } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout-with-tabs-and-widgets.util';
import {
  AggregateOperations,
  FieldMetadataType,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

const LAYOUT_NAME = 'Deactivated Chart Field Layout';
const TAB_TITLE = 'Deactivated Chart Field Tab';

describe('Page layout with tabs update with a chart referencing a deactivated field', () => {
  let testFieldMetadataIds: TestFieldMetadataIds;
  let aggregateFieldMetadataId: string;
  let pageLayoutId: string;
  let pageLayoutTabId: string;

  const chartWidgetId = v4();

  const buildChartWidget = () => ({
    id: chartWidgetId,
    pageLayoutTabId,
    title: 'Pipeline Value by Name',
    type: WidgetType.GRAPH,
    objectMetadataId: testFieldMetadataIds.objectMetadataId,
    position: {
      layoutMode: PageLayoutTabLayoutMode.GRID as const,
      row: 0,
      column: 0,
      rowSpan: 4,
      columnSpan: 4,
    },
    configuration: {
      configurationType: WidgetConfigurationType.PIE_CHART,
      aggregateFieldMetadataId,
      aggregateOperation: AggregateOperations.SUM,
      groupByFieldMetadataId: testFieldMetadataIds.fieldMetadataId2,
    } satisfies AllPageLayoutWidgetConfiguration,
  });

  beforeAll(async () => {
    testFieldMetadataIds = await fetchTestFieldMetadataIds();

    const { data: fieldData } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId: testFieldMetadataIds.objectMetadataId,
        type: FieldMetadataType.NUMBER,
        label: 'Deactivated Aggregate Field',
        name: `deactivatedAggregateField${Date.now()}`,
        isLabelSyncedWithName: false,
      },
    });

    aggregateFieldMetadataId = fieldData.createOneField.id;

    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: LAYOUT_NAME, type: PageLayoutType.DASHBOARD },
    });

    pageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: { title: TAB_TITLE, pageLayoutId },
    });

    pageLayoutTabId = tabData.createPageLayoutTab.id;

    await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: false,
      input: {
        id: pageLayoutId,
        name: LAYOUT_NAME,
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs: [
          {
            id: pageLayoutTabId,
            title: TAB_TITLE,
            position: 0,
            widgets: [buildChartWidget()],
          },
        ],
      },
    });

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: aggregateFieldMetadataId,
        updatePayload: { isActive: false },
      },
    });
  });

  afterAll(async () => {
    await destroyOnePageLayoutTab({
      expectToFail: false,
      input: { id: pageLayoutTabId },
    });
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: pageLayoutId },
    });
    await deleteOneFieldMetadata({
      expectToFail: false,
      input: { idToDelete: aggregateFieldMetadataId },
    });
  });

  it('should save other widgets when the chart is left unchanged', async () => {
    const iframeWidgetId = v4();
    const chartWidget = buildChartWidget();

    // Mirrors the front end, which echoes back the configuration it fetched
    // with __typename and explicit nulls the DTO types do not model
    const chartWidgetAsSentByClient = {
      ...chartWidget,
      configuration: {
        ...chartWidget.configuration,
        __typename: 'PieChartConfiguration',
        numberFormat: null,
        filter: null,
      } as unknown as AllPageLayoutWidgetConfiguration,
    };

    const { data, errors } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: false,
      input: {
        id: pageLayoutId,
        name: LAYOUT_NAME,
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs: [
          {
            id: pageLayoutTabId,
            title: TAB_TITLE,
            position: 0,
            widgets: [
              chartWidgetAsSentByClient,
              {
                id: iframeWidgetId,
                pageLayoutTabId,
                title: 'New Iframe Widget',
                type: WidgetType.IFRAME,
                objectMetadataId: null,
                position: {
                  layoutMode: PageLayoutTabLayoutMode.GRID as const,
                  row: 4,
                  column: 0,
                  rowSpan: 2,
                  columnSpan: 2,
                },
                configuration: {
                  configurationType: WidgetConfigurationType.IFRAME,
                  url: 'https://example.com',
                },
              },
            ],
          },
        ],
      },
    });

    expect(errors).toBeUndefined();

    const widgetIds = data.updatePageLayoutWithTabsAndWidgets.tabs?.[0].widgets
      ?.map((widget) => widget.id)
      .sort();

    expect(widgetIds).toEqual([chartWidgetId, iframeWidgetId].sort());
  });

  it('should reject the chart when one of its field references is edited', async () => {
    const chartWidget = buildChartWidget();

    const { errors } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: true,
      input: {
        id: pageLayoutId,
        name: LAYOUT_NAME,
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs: [
          {
            id: pageLayoutTabId,
            title: TAB_TITLE,
            position: 0,
            widgets: [
              {
                ...chartWidget,
                configuration: {
                  ...chartWidget.configuration,
                  groupByFieldMetadataId: testFieldMetadataIds.fieldMetadataId1,
                },
              },
            ],
          },
        ],
      },
    });

    expect(errors).toHaveLength(1);
    expect(errors?.[0].message).toContain(
      `aggregateFieldMetadataId "${aggregateFieldMetadataId}" not found.`,
    );
  });
});
