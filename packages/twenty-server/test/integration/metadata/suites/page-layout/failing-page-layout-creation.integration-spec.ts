import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';

import { PageLayoutType } from 'twenty-shared/types';

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

  it('when a dashboard filter has an unknown filter type', async () => {
    const { errors } = await createOnePageLayout({
      expectToFail: true,
      input: {
        name: 'Dashboard With Invalid Filter Type',
        type: PageLayoutType.DASHBOARD,
        dashboardFilters: [
          {
            id: 'amount',
            label: 'Amount',
            filterType: 'NUMBER',
          },
        ],
      } as unknown as CreatePageLayoutInput,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('when two dashboard filters share the same id', async () => {
    const { errors } = await createOnePageLayout({
      expectToFail: true,
      input: {
        name: 'Dashboard With Duplicated Filter Ids',
        type: PageLayoutType.DASHBOARD,
        dashboardFilters: [
          { id: 'date', label: 'Created', filterType: 'DATE_TIME' },
          { id: 'date', label: 'Closed', filterType: 'DATE' },
        ],
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('when dashboard filters are not an array', async () => {
    const { errors } = await createOnePageLayout({
      expectToFail: true,
      input: {
        name: 'Dashboard With Malformed Filters',
        type: PageLayoutType.DASHBOARD,
        dashboardFilters: { id: 'date' },
      } as unknown as CreatePageLayoutInput,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
