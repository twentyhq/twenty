import { randomUUID } from 'node:crypto';

import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { deleteOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/delete-one-view-filter.util';
import { findOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/find-one-view-filter.util';
import { findViewFilters } from 'test/integration/metadata/suites/view-filter/utils/find-view-filters.util';
import { createViewWithChildren } from 'test/integration/metadata/suites/view/utils/create-view-with-children.util';
import { deleteOneView } from 'test/integration/metadata/suites/view/utils/delete-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { setViewRowDeletedAt } from 'test/integration/metadata/suites/view/utils/set-view-row-deleted-at.util';
import { findAllMetadataRestListPages } from 'test/integration/rest/utils/find-all-metadata-rest-list-pages.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { maskUuids } from 'test/integration/utils/mask-uuids.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { ViewVisibility } from 'twenty-shared/types';

type ArrangedViewFilter = {
  viewFilterId: string;
  viewId: string;
  token?: string;
  cleanup: () => Promise<void>;
};

type TestContext = {
  arrange: () => Promise<ArrangedViewFilter>;
};

const arrangeViewFilter = async ({
  visibility = ViewVisibility.WORKSPACE,
  token,
  prepare = async () => ({}),
}: {
  visibility?: ViewVisibility;
  token?: string;
  prepare?: (
    arrangedViewFilter: ArrangedViewFilter,
  ) => Promise<Partial<ArrangedViewFilter>>;
} = {}): Promise<ArrangedViewFilter> => {
  const { viewId, childIdByChildName } = await createViewWithChildren({
    name: `View Filter read ${randomUUID().slice(0, 8)}`,
    visibility,
    token,
  });
  const arrangedViewFilter = {
    viewFilterId: childIdByChildName['view filter'],
    viewId,
    cleanup: async () => {
      await destroyOneView({ viewId, expectToFail: false });
    },
  };

  try {
    return { ...arrangedViewFilter, ...(await prepare(arrangedViewFilter)) };
  } catch (error) {
    await arrangedViewFilter.cleanup();

    throw error;
  }
};

const failingViewFilterReadTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'when the view filter does not exist',
    context: {
      arrange: async () => ({
        viewFilterId: randomUUID(),
        viewId: randomUUID(),
        cleanup: async () => {},
      }),
    },
  },
  {
    title: 'when the view filter is deleted',
    context: {
      arrange: () =>
        arrangeViewFilter({
          prepare: async (arrangedViewFilter) => {
            await deleteOneViewFilter({
              input: { id: arrangedViewFilter.viewFilterId },
              expectToFail: false,
            });

            return {};
          },
        }),
    },
  },
  {
    title: 'when the view filter is soft-deleted',
    context: {
      arrange: () =>
        arrangeViewFilter({
          prepare: async ({ viewFilterId, cleanup }) => {
            await setViewRowDeletedAt({
              tableName: 'viewFilter',
              id: viewFilterId,
              deletedAt: new Date(),
            });

            return {
              cleanup: async () => {
                await setViewRowDeletedAt({
                  tableName: 'viewFilter',
                  id: viewFilterId,
                  deletedAt: null,
                });
                await cleanup();
              },
            };
          },
        }),
    },
  },
  {
    title: 'when the view of the view filter is deleted',
    context: {
      arrange: () =>
        arrangeViewFilter({
          prepare: async ({ viewId }) => {
            await deleteOneView({ viewId, expectToFail: false });

            return { cleanup: async () => {} };
          },
        }),
    },
  },
  {
    title: 'when the view of the view filter is soft-deleted',
    context: {
      arrange: () =>
        arrangeViewFilter({
          prepare: async ({ viewId, cleanup }) => {
            await setViewRowDeletedAt({
              tableName: 'view',
              id: viewId,
              deletedAt: new Date(),
            });

            return {
              cleanup: async () => {
                await setViewRowDeletedAt({
                  tableName: 'view',
                  id: viewId,
                  deletedAt: null,
                });
                await cleanup();
              },
            };
          },
        }),
    },
  },
  {
    title:
      'when the view of the view filter is unlisted and belongs to another user',
    context: {
      arrange: () =>
        arrangeViewFilter({
          visibility: ViewVisibility.UNLISTED,
          token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
          prepare: async () => ({ token: APPLE_JONY_MEMBER_ACCESS_TOKEN }),
        }),
    },
  },
];

describe('View Filter read should fail', () => {
  it.each(eachTestingContextFilter(failingViewFilterReadTestCases))(
    '$title',
    async ({ context }) => {
      const {
        viewFilterId,
        viewId,
        token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
        cleanup,
      } = await context.arrange();

      try {
        const { errors } = await findOneViewFilter({
          id: viewFilterId,
          token,
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({
          errors,
          normalizeMessage: maskUuids,
        });

        const restResponse = await makeRestApiRequest({
          method: 'get',
          path: `/metadata/viewFilters/${viewFilterId}`,
          bearer: token,
        });

        expect(restResponse.status).toBe(404);
        expect(
          JSON.parse(maskUuids(JSON.stringify(restResponse.body))),
        ).toMatchSnapshot();

        const { data: viewFiltersOfView } = await findViewFilters({
          viewId,
          token,
          expectToFail: false,
        });
        const { data: allViewFilters } = await findViewFilters({
          token,
          expectToFail: false,
        });

        expect(
          viewFiltersOfView.getViewFilters.map(({ id }) => id),
        ).not.toContain(viewFilterId);
        expect(allViewFilters.getViewFilters.map(({ id }) => id)).not.toContain(
          viewFilterId,
        );

        for (const path of [
          `/metadata/viewFilters?viewId=${viewId}`,
          '/metadata/viewFilters',
        ]) {
          const pages = await findAllMetadataRestListPages({
            path,
            bearer: token,
          });

          expect(
            pages.flatMap(({ data }) => data.map(({ id }) => id)),
          ).not.toContain(viewFilterId);
        }
      } finally {
        await cleanup();
      }
    },
  );
});
