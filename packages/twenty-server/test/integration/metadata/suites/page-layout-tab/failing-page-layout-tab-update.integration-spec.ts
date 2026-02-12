import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { updateOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/update-one-page-layout-tab.util';

describe('Page layout tab update should fail', () => {
  it('when updating a non-existent page layout tab', async () => {
    const { errors } = await updateOnePageLayoutTab({
      expectToFail: true,
      input: {
        id: faker.string.uuid(),
        title: 'Updated Title',
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
