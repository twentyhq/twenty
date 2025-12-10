import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { updateOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/update-one-page-layout-widget.util';

describe('Page layout widget update should fail', () => {
  it('when updating a non-existent page layout widget', async () => {
    const { errors } = await updateOnePageLayoutWidget({
      expectToFail: true,
      input: {
        id: 'ed3752e3-db7f-42ff-82c0-2757a5410044',
        title: 'Updated Title',
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
