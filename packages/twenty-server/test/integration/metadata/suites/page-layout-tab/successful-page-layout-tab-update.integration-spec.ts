import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { updateOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/update-one-page-layout-tab.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';

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

  it('should update page layout tab title', async () => {
    const { data } = await updateOnePageLayoutTab({
      expectToFail: false,
      input: {
        id: testPageLayoutTabId,
        title: 'Updated Tab Title',
      },
    });

    expect(data.updatePageLayoutTab).toMatchObject({
      id: testPageLayoutTabId,
      title: 'Updated Tab Title',
    });
  });

  it('should update page layout tab position', async () => {
    const { data } = await updateOnePageLayoutTab({
      expectToFail: false,
      input: {
        id: testPageLayoutTabId,
        position: 10,
      },
    });

    expect(data.updatePageLayoutTab).toMatchObject({
      id: testPageLayoutTabId,
      position: 10,
    });
  });
});
