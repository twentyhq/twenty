import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { deleteOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/delete-one-page-layout-widget.util';

describe('Page layout widget deletion should fail', () => {
  it('when deleting a non-existent page layout widget', async () => {
    const { errors } = await deleteOnePageLayoutWidget({
      expectToFail: true,
      input: { id: faker.string.uuid() },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
