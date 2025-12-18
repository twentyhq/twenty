import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { destroyOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/destroy-one-page-layout-widget.util';
import { updateOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/update-one-page-layout-widget.util';
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
  input: {
    title?: string;
    type?: WidgetType;
    gridPosition?: {
      row: number;
      column: number;
      rowSpan: number;
      columnSpan: number;
    };
  };
};

const SUCCESSFUL_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'update page layout widget title',
    context: {
      input: {
        title: 'Updated Widget Title',
      },
    },
  },
  {
    title: 'update page layout widget type',
    context: {
      input: {
        type: WidgetType.GRAPH,
      },
    },
  },
  {
    title: 'update page layout widget grid position',
    context: {
      input: {
        gridPosition: {
          row: 2,
          column: 3,
          rowSpan: 2,
          columnSpan: 4,
        },
      },
    },
  },
];

describe('Page layout widget update should succeed', () => {
  let testPageLayoutId: string;
  let testPageLayoutTabId: string;
  let testPageLayoutWidgetId: string;

  beforeAll(async () => {
    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For Widget Updates' },
    });

    testPageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Test Tab For Widget Updates',
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

  beforeEach(async () => {
    const { data } = await createOnePageLayoutWidget({
      expectToFail: false,
      input: {
        title: 'Original Widget Title',
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

    testPageLayoutWidgetId = data.createPageLayoutWidget.id;
  });

  afterEach(async () => {
    await destroyOnePageLayoutWidget({
      expectToFail: false,
      input: { id: testPageLayoutWidgetId },
    });
  });

  it.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
    'should $title',
    async ({ context: { input } }) => {
      const { data } = await updateOnePageLayoutWidget({
        expectToFail: false,
        input: {
          id: testPageLayoutWidgetId,
          ...input,
        },
      });

      expect(data.updatePageLayoutWidget).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...data.updatePageLayoutWidget }),
      );
    },
  );
});
