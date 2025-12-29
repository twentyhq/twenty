import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { destroyOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/destroy-one-page-layout-widget.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

type TestContext = {
  input: {
    title: string;
    type: WidgetType;
    configuration: AllPageLayoutWidgetConfiguration;
    gridPosition: {
      row: number;
      column: number;
      rowSpan: number;
      columnSpan: number;
    };
  };
};

const SUCCESSFUL_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'create a page layout widget',
    context: {
      input: {
        title: 'Test Widget',
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
    },
  },
  {
    title: 'create a page layout widget with specific type',
    context: {
      input: {
        title: 'Iframe Widget',
        type: WidgetType.IFRAME,
        configuration: {
          configurationType: WidgetConfigurationType.IFRAME,
          url: 'https://example.com',
        },
        gridPosition: {
          row: 0,
          column: 0,
          rowSpan: 2,
          columnSpan: 2,
        },
      },
    },
  },
];

describe('Page layout widget creation should succeed', () => {
  let testPageLayoutId: string;
  let testPageLayoutTabId: string;
  let createdPageLayoutWidgetId: string;

  beforeAll(async () => {
    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For Widgets' },
    });

    testPageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Test Tab For Widgets',
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

  afterEach(async () => {
    if (createdPageLayoutWidgetId) {
      await destroyOnePageLayoutWidget({
        expectToFail: false,
        input: { id: createdPageLayoutWidgetId },
      });
    }
  });

  it.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
    'should $title',
    async ({ context: { input } }) => {
      const { data } = await createOnePageLayoutWidget({
        expectToFail: false,
        input: {
          ...input,
          pageLayoutTabId: testPageLayoutTabId,
        },
      });

      createdPageLayoutWidgetId = data?.createPageLayoutWidget?.id;

      expect(data.createPageLayoutWidget).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...data.createPageLayoutWidget }),
      );
    },
  );
});
