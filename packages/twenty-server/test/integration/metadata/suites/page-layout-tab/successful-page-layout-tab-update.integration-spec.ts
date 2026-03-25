import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { updateOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/update-one-page-layout-tab.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

type TestContext = {
  input: {
    title?: string;
    position?: number;
  };
};

const SUCCESSFUL_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'update page layout tab title',
    context: {
      input: {
        title: 'Updated Tab Title',
      },
    },
  },
  {
    title: 'update page layout tab position',
    context: {
      input: {
        position: 10,
      },
    },
  },
];

describe('Page layout tab update should succeed', () => {
  let testPageLayoutId: string;
  let testPageLayoutTabId: string;

  beforeAll(async () => {
    const { data } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For Tab Updates' },
    });

    testPageLayoutId = data.createPageLayout.id;
  });

  afterAll(async () => {
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: testPageLayoutId },
    });
  });

  beforeEach(async () => {
    const { data } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Original Tab Title',
        pageLayoutId: testPageLayoutId,
      },
    });

    testPageLayoutTabId = data.createPageLayoutTab.id;
  });

  afterEach(async () => {
    await destroyOnePageLayoutTab({
      expectToFail: false,
      input: { id: testPageLayoutTabId },
    });
  });

  it.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
    'should $title',
    async ({ context: { input } }) => {
      const { data } = await updateOnePageLayoutTab({
        expectToFail: false,
        input: {
          id: testPageLayoutTabId,
          ...input,
        },
      });

      expect(data.updatePageLayoutTab).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...data.updatePageLayoutTab }),
      );
    },
  );
});
