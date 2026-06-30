import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';

import { type CreatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-page-layout.input';

describe('Page layout creation should fail', () => {
  it('when name is missing', async () => {
    const { errors } = await createOnePageLayout({
      expectToFail: true,
      input: {} as CreatePageLayoutInput,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('when name is empty string', async () => {
    const { errors } = await createOnePageLayout({
      expectToFail: true,
      input: { name: '' },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
