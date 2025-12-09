import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';

describe('Page layout tab creation should succeed', () => {
  let testPageLayoutId: string;
  let createdPageLayoutTabId: string;

  beforeAll(async () => {
    const { data } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For Tabs' },
    });

    testPageLayoutId = data.createPageLayout.id;
  });

  afterAll(async () => {
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: testPageLayoutId },
    });
  });

  afterEach(async () => {
    if (createdPageLayoutTabId) {
      await destroyOnePageLayoutTab({
        expectToFail: false,
        input: { id: createdPageLayoutTabId },
      });
      createdPageLayoutTabId = '';
    }
  });

  it('should create a page layout tab', async () => {
    const { data } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Test Tab',
        pageLayoutId: testPageLayoutId,
      },
    });

    createdPageLayoutTabId = data?.createPageLayoutTab?.id;

    expect(data.createPageLayoutTab).toMatchObject({
      id: expect.any(String),
      title: 'Test Tab',
      pageLayoutId: testPageLayoutId,
    });
  });

  it('should create a page layout tab with position', async () => {
    const { data } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Positioned Tab',
        pageLayoutId: testPageLayoutId,
        position: 5,
      },
    });

    createdPageLayoutTabId = data?.createPageLayoutTab?.id;

    expect(data.createPageLayoutTab).toMatchObject({
      id: expect.any(String),
      title: 'Positioned Tab',
      position: 5,
    });
  });
});
