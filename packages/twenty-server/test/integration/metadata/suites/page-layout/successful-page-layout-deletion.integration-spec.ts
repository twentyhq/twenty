import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { deleteOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/delete-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { restoreOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/restore-one-page-layout.util';

describe('Page layout deletion should succeed', () => {
  it('should soft delete and restore a page layout', async () => {
    const { data: createData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Page Layout To Delete' },
    });

    const pageLayoutId = createData.createPageLayout.id;

    const { data: deleteData } = await deleteOnePageLayout({
      expectToFail: false,
      input: { id: pageLayoutId },
    });

    expect(deleteData.deletePageLayout.deletedAt).not.toBeNull();

    const { data: restoreData } = await restoreOnePageLayout({
      expectToFail: false,
      input: { id: pageLayoutId },
    });

    expect(restoreData.restorePageLayout.deletedAt).toBeNull();

    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: pageLayoutId },
    });
  });

  it('should hard delete a page layout', async () => {
    const { data: createData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Page Layout To Destroy' },
    });

    const { data: destroyData } = await destroyOnePageLayout({
      expectToFail: false,
      input: { id: createData.createPageLayout.id },
    });

    expect(destroyData.destroyPageLayout).toBe(true);
  });
});
