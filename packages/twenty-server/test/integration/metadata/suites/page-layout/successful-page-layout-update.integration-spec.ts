import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { updateOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout.util';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

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

  it('should update page layout name', async () => {
    const { data } = await updateOnePageLayout({
      expectToFail: false,
      input: {
        id: testPageLayoutId,
        name: 'Updated Page Layout Name',
      },
    });

    expect(data.updatePageLayout).toMatchObject({
      id: testPageLayoutId,
      name: 'Updated Page Layout Name',
    });
  });

  it('should update page layout type', async () => {
    const { data } = await updateOnePageLayout({
      expectToFail: false,
      input: {
        id: testPageLayoutId,
        type: PageLayoutType.DASHBOARD,
      },
    });

    expect(data.updatePageLayout).toMatchObject({
      id: testPageLayoutId,
      type: PageLayoutType.DASHBOARD,
    });
  });
});
