import {
  INVALID_IFRAME_CONFIG_BAD_URL,
  INVALID_NUMBER_CHART_CONFIG_BAD_UUID,
  INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS,
  INVALID_NUMBER_CHART_CONFIG_NULL_AGGREGATE_FIELD,
} from 'test/integration/constants/widget-configuration-test-data.constants';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { updateOnePageLayoutWithTabsAndWidgets } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout-with-tabs-and-widgets.util';
import { v4 } from 'uuid';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { WidgetType } from 'src/engine/metadata-modules/page-layout/enums/widget-type.enum';

describe('Page layout with tabs update should fail', () => {
  it('when updating a non-existent page layout', async () => {
    const tabId = 'bb4bd7f2-2f89-429c-9d85-8c20a6f776ea';
    const widgetId = 'cf89849b-2106-4b51-8945-359ffeb88141';

    const { errors } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: true,
      input: {
        id: '5b66ba47-198c-4b0d-8583-cd4745f8f9f3',
        name: 'Updated Name',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: null,
        tabs: [
          {
            id: tabId,
            title: 'Tab 1',
            position: 0,
            widgets: [
              {
                id: widgetId,
                pageLayoutTabId: tabId,
                title: 'Widget 1',
                type: WidgetType.FIELDS,
                objectMetadataId: null,
                gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
                configuration: null,
              },
            ],
          },
        ],
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  describe('with invalid widget configuration', () => {
    let testPageLayoutId: string;
    let testTabId: string;

    beforeEach(async () => {
      const { data: layoutData } = await createOnePageLayout({
        expectToFail: false,
        input: {
          name: 'Test Page Layout',
          type: PageLayoutType.DASHBOARD,
        },
      });

      testPageLayoutId = layoutData.createPageLayout.id;

      const { data: tabData } = await createOnePageLayoutTab({
        expectToFail: false,
        input: {
          title: 'Test Tab',
          pageLayoutId: testPageLayoutId,
        },
      });

      testTabId = tabData.createPageLayoutTab.id;
    });

    afterEach(async () => {
      await destroyOnePageLayoutTab({
        expectToFail: false,
        input: { id: testTabId },
      });
      await destroyOnePageLayout({
        expectToFail: false,
        input: { id: testPageLayoutId },
      });
    });

    it('when GRAPH widget has null configuration', async () => {
      const widgetId = v4();

      const { errors } = await updateOnePageLayoutWithTabsAndWidgets({
        expectToFail: true,
        input: {
          id: testPageLayoutId,
          name: 'Updated Name',
          type: PageLayoutType.DASHBOARD,
          objectMetadataId: null,
          tabs: [
            {
              id: testTabId,
              title: 'Tab 1',
              position: 0,
              widgets: [
                {
                  id: widgetId,
                  pageLayoutTabId: testTabId,
                  title: 'Graph Widget',
                  type: WidgetType.GRAPH,
                  objectMetadataId: null,
                  gridPosition: {
                    row: 0,
                    column: 0,
                    rowSpan: 1,
                    columnSpan: 1,
                  },
                  configuration: null,
                },
              ],
            },
          ],
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });

    it('when GRAPH widget has null aggregateFieldMetadataId', async () => {
      const widgetId = v4();

      const { errors } = await updateOnePageLayoutWithTabsAndWidgets({
        expectToFail: true,
        input: {
          id: testPageLayoutId,
          name: 'Updated Name',
          type: PageLayoutType.DASHBOARD,
          objectMetadataId: null,
          tabs: [
            {
              id: testTabId,
              title: 'Tab 1',
              position: 0,
              widgets: [
                {
                  id: widgetId,
                  pageLayoutTabId: testTabId,
                  title: 'Graph Widget',
                  type: WidgetType.GRAPH,
                  objectMetadataId: null,
                  gridPosition: {
                    row: 0,
                    column: 0,
                    rowSpan: 1,
                    columnSpan: 1,
                  },
                  configuration:
                    INVALID_NUMBER_CHART_CONFIG_NULL_AGGREGATE_FIELD as any,
                },
              ],
            },
          ],
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });

    it('when GRAPH widget has missing required fields', async () => {
      const widgetId = v4();

      const { errors } = await updateOnePageLayoutWithTabsAndWidgets({
        expectToFail: true,
        input: {
          id: testPageLayoutId,
          name: 'Updated Name',
          type: PageLayoutType.DASHBOARD,
          objectMetadataId: null,
          tabs: [
            {
              id: testTabId,
              title: 'Tab 1',
              position: 0,
              widgets: [
                {
                  id: widgetId,
                  pageLayoutTabId: testTabId,
                  title: 'Graph Widget',
                  type: WidgetType.GRAPH,
                  objectMetadataId: null,
                  gridPosition: {
                    row: 0,
                    column: 0,
                    rowSpan: 1,
                    columnSpan: 1,
                  },
                  configuration:
                    INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS as any,
                },
              ],
            },
          ],
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });

    it('when GRAPH widget has invalid UUID format', async () => {
      const widgetId = v4();

      const { errors } = await updateOnePageLayoutWithTabsAndWidgets({
        expectToFail: true,
        input: {
          id: testPageLayoutId,
          name: 'Updated Name',
          type: PageLayoutType.DASHBOARD,
          objectMetadataId: null,
          tabs: [
            {
              id: testTabId,
              title: 'Tab 1',
              position: 0,
              widgets: [
                {
                  id: widgetId,
                  pageLayoutTabId: testTabId,
                  title: 'Graph Widget',
                  type: WidgetType.GRAPH,
                  objectMetadataId: null,
                  gridPosition: {
                    row: 0,
                    column: 0,
                    rowSpan: 1,
                    columnSpan: 1,
                  },
                  configuration: INVALID_NUMBER_CHART_CONFIG_BAD_UUID as any,
                },
              ],
            },
          ],
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });

    it('when IFRAME widget has invalid URL', async () => {
      const widgetId = v4();

      const { errors } = await updateOnePageLayoutWithTabsAndWidgets({
        expectToFail: true,
        input: {
          id: testPageLayoutId,
          name: 'Updated Name',
          type: PageLayoutType.DASHBOARD,
          objectMetadataId: null,
          tabs: [
            {
              id: testTabId,
              title: 'Tab 1',
              position: 0,
              widgets: [
                {
                  id: widgetId,
                  pageLayoutTabId: testTabId,
                  title: 'Iframe Widget',
                  type: WidgetType.IFRAME,
                  objectMetadataId: null,
                  gridPosition: {
                    row: 0,
                    column: 0,
                    rowSpan: 1,
                    columnSpan: 1,
                  },
                  configuration: INVALID_IFRAME_CONFIG_BAD_URL as any,
                },
              ],
            },
          ],
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });
  });
});
