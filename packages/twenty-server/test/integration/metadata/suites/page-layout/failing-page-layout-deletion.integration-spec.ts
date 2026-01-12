import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';

describe('Page layout deletion should fail', () => {
  it('when destroying a non-existent page layout', async () => {
    const { errors } = await destroyOnePageLayout({
      expectToFail: true,
      input: { id: faker.string.uuid() },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
