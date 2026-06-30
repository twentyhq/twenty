import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { updateOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

type TestContext = {
  input: {
    name?: string;
    type?: PageLayoutType;
  };
};

const SUCCESSFUL_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'update page layout name',
    context: {
      input: {
        name: 'Updated Page Layout Name',
      },
    },
  },
  {
    title: 'update page layout type',
    context: {
      input: {
        type: PageLayoutType.DASHBOARD,
      },
    },
  },
];

describe('Page layout update should succeed', () => {
  let testPageLayoutId: string;

  beforeEach(async () => {
    const { data } = await createOnePageLayout({
      expectToFail: false,
      input: {
        name: 'Original Page Layout',
        type: PageLayoutType.RECORD_PAGE,
      },
    });

    testPageLayoutId = data.createPageLayout.id;
  });

  afterEach(async () => {
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: testPageLayoutId },
    });
  });

  it.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
    'should $title',
    async ({ context: { input } }) => {
      const { data } = await updateOnePageLayout({
        expectToFail: false,
        input: {
          id: testPageLayoutId,
          ...input,
        },
      });

      expect(data.updatePageLayout).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...data.updatePageLayout }),
      );
    },
  );
});
