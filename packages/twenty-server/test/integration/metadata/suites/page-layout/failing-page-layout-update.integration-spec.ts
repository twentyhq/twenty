import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { updateOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout.util';

describe('Page layout update should fail', () => {
  it('when updating a non-existent page layout', async () => {
    const { errors } = await updateOnePageLayout({
      expectToFail: true,
      input: {
        id: faker.string.uuid(),
        name: 'Updated Name',
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
