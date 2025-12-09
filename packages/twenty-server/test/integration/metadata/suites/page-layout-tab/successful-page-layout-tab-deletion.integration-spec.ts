import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { deleteOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/delete-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { restoreOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/restore-one-page-layout-tab.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';

describe('Page layout tab deletion should succeed', () => {
  let testPageLayoutId: string;

  beforeAll(async () => {
    const { data } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For Tab Deletions' },
    });

    testPageLayoutId = data.createPageLayout.id;
  });

  afterAll(async () => {
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: testPageLayoutId },
    });
  });

  it('should soft delete and restore a page layout tab', async () => {
    const { data: createData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Tab To Delete',
        pageLayoutId: testPageLayoutId,
      },
    });

    const tabId = createData.createPageLayoutTab.id;

    const { data: deleteData } = await deleteOnePageLayoutTab({
      expectToFail: false,
      input: { id: tabId },
    });

    expect(deleteData.deletePageLayoutTab).toBe(true);

    const { data: restoreData } = await restoreOnePageLayoutTab({
      expectToFail: false,
      input: { id: tabId },
    });

    expect(restoreData.restorePageLayoutTab.deletedAt).toBeNull();

    await destroyOnePageLayoutTab({
      expectToFail: false,
      input: { id: tabId },
    });
  });

  it('should hard delete a page layout tab', async () => {
    const { data: createData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Tab To Destroy',
        pageLayoutId: testPageLayoutId,
      },
    });

    const { data: destroyData } = await destroyOnePageLayoutTab({
      expectToFail: false,
      input: { id: createData.createPageLayoutTab.id },
    });

    expect(destroyData.destroyPageLayoutTab).toBe(true);
  });
});
