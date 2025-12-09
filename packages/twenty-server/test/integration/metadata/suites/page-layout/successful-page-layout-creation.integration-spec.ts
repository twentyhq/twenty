import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

describe('Page layout creation should succeed', () => {
  let createdPageLayoutId: string;

  afterEach(async () => {
    if (createdPageLayoutId) {
      await destroyOnePageLayout({
        expectToFail: false,
        input: { id: createdPageLayoutId },
      });
    }
  });

  it('should create a page layout with minimal input', async () => {
    const { data } = await createOnePageLayout({
      expectToFail: false,
      input: {
        name: 'Test Page Layout',
      },
    });

    createdPageLayoutId = data?.createPageLayout?.id;

    expect(data.createPageLayout).toMatchObject({
      id: expect.any(String),
      name: 'Test Page Layout',
      type: PageLayoutType.RECORD_PAGE,
    });
  });

  it('should create a page layout with DASHBOARD type', async () => {
    const { data } = await createOnePageLayout({
      expectToFail: false,
      input: {
        name: 'Dashboard Layout',
        type: PageLayoutType.DASHBOARD,
      },
    });

    createdPageLayoutId = data?.createPageLayout?.id;

    expect(data.createPageLayout).toMatchObject({
      id: expect.any(String),
      name: 'Dashboard Layout',
      type: PageLayoutType.DASHBOARD,
    });
  });
});
