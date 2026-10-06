import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { updateOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout.util';
import { PageLayoutType, ViewFilterOperand } from 'twenty-shared/types';

import { type UpdatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout.input';

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

  describe('dashboard filters validation failures', () => {
    let testPageLayoutId: string;

    beforeAll(async () => {
      const { data } = await createOnePageLayout({
        expectToFail: false,
        input: {
          name: 'Dashboard For Filter Validation Failures',
          type: PageLayoutType.DASHBOARD,
        },
      });

      testPageLayoutId = data.createPageLayout.id;
    });

    afterAll(async () => {
      await destroyOnePageLayout({
        expectToFail: false,
        input: { id: testPageLayoutId },
      });
    });

    it('when a dashboard filter has an unknown filter type', async () => {
      const { errors } = await updateOnePageLayout({
        expectToFail: true,
        input: {
          id: testPageLayoutId,
          dashboardFilters: [
            { id: 'amount', label: 'Amount', filterType: 'NUMBER' },
          ],
        } as unknown as { id: string } & UpdatePageLayoutInput,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });

    it('when a dashboard filter default value operand is not allowed for its filter type', async () => {
      const { errors } = await updateOnePageLayout({
        expectToFail: true,
        input: {
          id: testPageLayoutId,
          dashboardFilters: [
            {
              id: 'created',
              label: 'Created',
              filterType: 'DATE_TIME',
              defaultValue: {
                operand: ViewFilterOperand.CONTAINS,
                value: 'acme',
              },
            },
          ],
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });
  });
});
