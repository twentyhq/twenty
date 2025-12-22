import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';

import { type CreatePageLayoutTabInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/create-page-layout-tab.input';

describe('Page layout tab creation should fail', () => {
  let testPageLayoutId: string;

  beforeAll(async () => {
    const { data } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For Tab Creation Failures' },
    });

    testPageLayoutId = data.createPageLayout.id;
  });

  afterAll(async () => {
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: testPageLayoutId },
    });
  });

  it('when title is missing', async () => {
    const { errors } = await createOnePageLayoutTab({
      expectToFail: true,
      input: { pageLayoutId: testPageLayoutId } as CreatePageLayoutTabInput,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('when pageLayoutId references non-existent layout', async () => {
    const { errors } = await createOnePageLayoutTab({
      expectToFail: true,
      input: {
        title: 'Tab With Non-Existent Layout',
        pageLayoutId: faker.string.uuid(),
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
