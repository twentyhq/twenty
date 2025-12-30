import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { deleteOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/delete-one-page-layout-widget.util';
import { destroyOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/destroy-one-page-layout-widget.util';
import { restoreOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/restore-one-page-layout-widget.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';

type TestContext = {
  title: string;
  operation: 'soft-delete-restore' | 'hard-delete';
};

const SUCCESSFUL_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'soft delete and restore a page layout widget',
    context: {
      title: 'Widget To Delete',
      operation: 'soft-delete-restore',
    },
  },
  {
    title: 'hard delete a page layout widget',
    context: {
      title: 'Widget To Destroy',
      operation: 'hard-delete',
    },
  },
];

describe('Page layout widget deletion should succeed', () => {
  let testPageLayoutId: string;
  let testPageLayoutTabId: string;

  beforeAll(async () => {
    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For Widget Deletions' },
    });

    testPageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Test Tab For Widget Deletions',
        pageLayoutId: testPageLayoutId,
      },
    });

    testPageLayoutTabId = tabData.createPageLayoutTab.id;
  });

  afterAll(async () => {
    await destroyOnePageLayoutTab({
      expectToFail: false,
      input: { id: testPageLayoutTabId },
    });
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: testPageLayoutId },
    });
  });

  it.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
    'should $title',
    async ({ context: { title, operation } }) => {
      const { data: createData } = await createOnePageLayoutWidget({
        expectToFail: false,
        input: {
          title,
          pageLayoutTabId: testPageLayoutTabId,
          type: WidgetType.IFRAME,
          configuration: {
            configurationType: WidgetConfigurationType.IFRAME,
          },
          gridPosition: {
            row: 0,
            column: 0,
            rowSpan: 1,
            columnSpan: 1,
          },
        },
      });

      const widgetId = createData.createPageLayoutWidget.id;

      if (operation === 'soft-delete-restore') {
        const { data: deleteData } = await deleteOnePageLayoutWidget({
          expectToFail: false,
          input: { id: widgetId },
        });

        expect(deleteData.deletePageLayoutWidget).toMatchSnapshot(
          extractRecordIdsAndDatesAsExpectAny({
            ...deleteData.deletePageLayoutWidget,
          }),
        );

        const { data: restoreData } = await restoreOnePageLayoutWidget({
          expectToFail: false,
          input: { id: widgetId },
        });

        expect(restoreData.restorePageLayoutWidget).toMatchSnapshot(
          extractRecordIdsAndDatesAsExpectAny({
            ...restoreData.restorePageLayoutWidget,
          }),
        );

        await destroyOnePageLayoutWidget({
          expectToFail: false,
          input: { id: widgetId },
        });
      } else {
        const { data: destroyData } = await destroyOnePageLayoutWidget({
          expectToFail: false,
          input: { id: widgetId },
        });

        expect(destroyData.destroyPageLayoutWidget).toBe(true);
      }
    },
  );
});
