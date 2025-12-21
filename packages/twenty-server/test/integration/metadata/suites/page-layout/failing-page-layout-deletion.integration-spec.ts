import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { deleteOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/delete-one-page-layout.util';

describe('Page layout deletion should fail', () => {
  it('when deleting a non-existent page layout', async () => {
    const { errors } = await deleteOnePageLayout({
      expectToFail: true,
      input: { id: faker.string.uuid() },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
