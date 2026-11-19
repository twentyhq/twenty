import { randomUUID } from 'node:crypto';

import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { deleteOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/delete-one-view-sort.util';
import { findOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/find-one-view-sort.util';
import { findViewSorts } from 'test/integration/metadata/suites/view-sort/utils/find-view-sorts.util';
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

type ArrangedViewSort = {
  viewSortId: string;
  viewId: string;
  token?: string;
  cleanup: () => Promise<void>;
};

type TestContext = {
  arrange: () => Promise<ArrangedViewSort>;
};

const arrangeViewSort = async ({
  visibility = ViewVisibility.WORKSPACE,
  token,
  prepare = async () => ({}),
}: {
  visibility?: ViewVisibility;
  token?: string;
  prepare?: (
    arrangedViewSort: ArrangedViewSort,
  ) => Promise<Partial<ArrangedViewSort>>;
} = {}): Promise<ArrangedViewSort> => {
  const { viewId, childIdByChildName } = await createViewWithChildren({
    name: `View Sort read ${randomUUID().slice(0, 8)}`,
    visibility,
    token,
  });
  const arrangedViewSort = {
    viewSortId: childIdByChildName['view sort'],
    viewId,
    cleanup: async () => {
      await destroyOneView({ viewId, expectToFail: false });
    },
  };

  try {
    return { ...arrangedViewSort, ...(await prepare(arrangedViewSort)) };
  } catch (error) {
    await arrangedViewSort.cleanup();

    throw error;
  }
};

const failingViewSortReadTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'when the view sort does not exist',
    context: {
      arrange: async () => ({
        viewSortId: randomUUID(),
        viewId: randomUUID(),
        cleanup: async () => {},
      }),
    },
  },
  {
    title: 'when the view sort is deleted',
    context: {
      arrange: () =>
        arrangeViewSort({
          prepare: async (arrangedViewSort) => {
            await deleteOneViewSort({
              input: { id: arrangedViewSort.viewSortId },
              expectToFail: false,
            });

            return {};
          },
        }),
    },
  },
  {
    title: 'when the view sort is soft-deleted',
    context: {
      arrange: () =>
        arrangeViewSort({
          prepare: async ({ viewSortId, cleanup }) => {
            await setViewRowDeletedAt({
              tableName: 'viewSort',
              id: viewSortId,
              deletedAt: new Date(),
            });

            return {
              cleanup: async () => {
                await setViewRowDeletedAt({
                  tableName: 'viewSort',
                  id: viewSortId,
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
    title: 'when the view of the view sort is deleted',
    context: {
      arrange: () =>
        arrangeViewSort({
          prepare: async ({ viewId }) => {
            await deleteOneView({ viewId, expectToFail: false });

            return { cleanup: async () => {} };
          },
        }),
    },
  },
  {
    title: 'when the view of the view sort is soft-deleted',
    context: {
      arrange: () =>
        arrangeViewSort({
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
      'when the view of the view sort is unlisted and belongs to another user',
    context: {
      arrange: () =>
        arrangeViewSort({
          visibility: ViewVisibility.UNLISTED,
          token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
          prepare: async () => ({ token: APPLE_JONY_MEMBER_ACCESS_TOKEN }),
        }),
    },
  },
];

describe('View Sort read should fail', () => {
  it.each(eachTestingContextFilter(failingViewSortReadTestCases))(
    '$title',
    async ({ context }) => {
      const {
        viewSortId,
        viewId,
        token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
        cleanup,
      } = await context.arrange();

      try {
        const { errors } = await findOneViewSort({
          id: viewSortId,
          token,
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({
          errors,
          normalizeMessage: maskUuids,
        });

        const restResponse = await makeRestApiRequest({
          method: 'get',
          path: `/metadata/viewSorts/${viewSortId}`,
          bearer: token,
        });

        expect(restResponse.status).toBe(404);
        expect(
          JSON.parse(maskUuids(JSON.stringify(restResponse.body))),
        ).toMatchSnapshot();

        const { data: viewSortsOfView } = await findViewSorts({
          viewId,
          token,
          expectToFail: false,
        });
        const { data: allViewSorts } = await findViewSorts({
          token,
          expectToFail: false,
        });

        expect(viewSortsOfView.getViewSorts.map(({ id }) => id)).not.toContain(
          viewSortId,
        );
        expect(allViewSorts.getViewSorts.map(({ id }) => id)).not.toContain(
          viewSortId,
        );

        for (const path of [
          `/metadata/viewSorts?viewId=${viewId}`,
          '/metadata/viewSorts',
        ]) {
          const pages = await findAllMetadataRestListPages({
            path,
            bearer: token,
          });

          expect(
            pages.flatMap(({ data }) => data.map(({ id }) => id)),
          ).not.toContain(viewSortId);
        }
      } finally {
        await cleanup();
      }
    },
  );
});
