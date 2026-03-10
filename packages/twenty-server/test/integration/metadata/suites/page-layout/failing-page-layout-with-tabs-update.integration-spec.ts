import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
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
import { AggregateOperations, FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

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
                configuration: {
                  configurationType: WidgetConfigurationType.IFRAME,
                },
              },
            ],
          },
        ],
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  describe('chart filter validation failures', () => {
    let testFieldMetadataIds: TestFieldMetadataIds;
    let testPageLayoutId: string | undefined;
    let testPageLayoutTabId: string | undefined;
    let testFilterFieldMetadataId: string | undefined;
    let testFilterFieldDeleted = false;

    beforeAll(async () => {
      testFieldMetadataIds = await fetchTestFieldMetadataIds();
    });

    beforeEach(async () => {
      const filterFieldName = `deletedFilterField${Date.now()}`;

      const { data: createdFieldData } = await createOneFieldMetadata({
        expectToFail: false,
        input: {
          objectMetadataId: testFieldMetadataIds.objectMetadataId,
          type: FieldMetadataType.TEXT,
          label: 'Deleted Filter Field',
          name: filterFieldName,
          isLabelSyncedWithName: false,
        },
      });

      testFilterFieldMetadataId = createdFieldData.createOneField.id;

      const { data: layoutData } = await createOnePageLayout({
        expectToFail: false,
        input: {
          name: 'Deleted Filter Field Layout',
          type: PageLayoutType.RECORD_PAGE,
        },
      });

      testPageLayoutId = layoutData.createPageLayout.id;

      const { data: tabData } = await createOnePageLayoutTab({
        expectToFail: false,
        input: {
          title: 'Deleted Filter Field Tab',
          pageLayoutId: testPageLayoutId,
        },
      });

      testPageLayoutTabId = tabData.createPageLayoutTab.id;
      testFilterFieldDeleted = false;
    });

    afterEach(async () => {
      if (isDefined(testFilterFieldMetadataId) && !testFilterFieldDeleted) {
        await updateOneFieldMetadata({
          expectToFail: false,
          input: {
            idToUpdate: testFilterFieldMetadataId,
            updatePayload: {
              isActive: false,
            },
          },
        });
        await deleteOneFieldMetadata({
          expectToFail: false,
          input: {
            idToDelete: testFilterFieldMetadataId,
          },
        });
      }

      if (isDefined(testPageLayoutTabId)) {
        await destroyOnePageLayoutTab({
          expectToFail: false,
          input: { id: testPageLayoutTabId },
        });
      }

      if (isDefined(testPageLayoutId)) {
        await destroyOnePageLayout({
          expectToFail: false,
          input: { id: testPageLayoutId },
        });
      }

      testFilterFieldMetadataId = undefined;
      testPageLayoutTabId = undefined;
      testPageLayoutId = undefined;
      testFilterFieldDeleted = false;
    });

    it('when saving layout tabs and widgets with a deleted chart filter field', async () => {
      if (
        !isDefined(testPageLayoutId) ||
        !isDefined(testPageLayoutTabId) ||
        !isDefined(testFilterFieldMetadataId)
      ) {
        throw new Error('Test setup incomplete');
      }

      const chartWidgetId = v4();
      const chartTitle = 'Opportunities by Name';
      const chartConfiguration = {
        configurationType: WidgetConfigurationType.PIE_CHART,
        aggregateFieldMetadataId: testFieldMetadataIds.fieldMetadataId1,
        aggregateOperation: AggregateOperations.COUNT,
        groupByFieldMetadataId: testFieldMetadataIds.fieldMetadataId2,
        filter: {
          recordFilters: [
            {
              fieldMetadataId: testFilterFieldMetadataId,
              operand: 'contains',
              value: 'acme',
            },
          ],
          recordFilterGroups: [],
        },
      } satisfies AllPageLayoutWidgetConfiguration;

      const tabs = [
        {
          id: testPageLayoutTabId,
          title: 'Deleted Filter Field Tab',
          position: 0,
          widgets: [
            {
              id: chartWidgetId,
              pageLayoutTabId: testPageLayoutTabId,
              title: chartTitle,
              type: WidgetType.GRAPH,
              objectMetadataId: testFieldMetadataIds.objectMetadataId,
              gridPosition: {
                row: 0,
                column: 0,
                rowSpan: 1,
                columnSpan: 1,
              },
              configuration: chartConfiguration,
            },
          ],
        },
      ];

      await updateOnePageLayoutWithTabsAndWidgets({
        expectToFail: false,
        input: {
          id: testPageLayoutId,
          name: 'Deleted Filter Field Layout',
          type: PageLayoutType.RECORD_PAGE,
          objectMetadataId: null,
          tabs,
        },
      });

      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: testFilterFieldMetadataId,
          updatePayload: {
            isActive: false,
          },
        },
      });

      await deleteOneFieldMetadata({
        expectToFail: false,
        input: {
          idToDelete: testFilterFieldMetadataId,
        },
      });

      testFilterFieldDeleted = true;

      const { errors } = await updateOnePageLayoutWithTabsAndWidgets({
        expectToFail: true,
        input: {
          id: testPageLayoutId,
          name: 'Deleted Filter Field Layout',
          type: PageLayoutType.RECORD_PAGE,
          objectMetadataId: null,
          tabs,
        },
      });

      expect(errors).toBeDefined();
      expect(errors).toHaveLength(1);

      const [firstError] = errors!;

      expect(firstError.extensions.code).toBe('BAD_USER_INPUT');
      expect(firstError.message).toContain(`Chart "${chartTitle}":`);
      expect(firstError.message).toContain(
        'Please remove or replace this filter rule.',
      );
      expect(
        String(firstError.extensions.userFriendlyMessage),
      ).toContain(`Chart "${chartTitle}":`);
    });
  });
});
