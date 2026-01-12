import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';

describe('Page layout deletion should succeed', () => {
  it('should hard delete a page layout', async () => {
    const { data: createData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Page Layout To Destroy' },
    });

    const pageLayoutId = createData.createPageLayout.id;

    const { data: destroyData } = await destroyOnePageLayout({
      expectToFail: false,
      input: { id: pageLayoutId },
    });

    expect(destroyData.destroyPageLayout).toBe(true);
  });
});
