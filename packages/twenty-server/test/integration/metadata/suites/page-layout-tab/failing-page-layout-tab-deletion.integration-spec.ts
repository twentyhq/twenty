import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { deleteOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/delete-one-page-layout-tab.util';

describe('Page layout tab deletion should fail', () => {
  it('when deleting a non-existent page layout tab', async () => {
    const { errors } = await deleteOnePageLayoutTab({
      expectToFail: true,
      input: { id: faker.string.uuid() },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
