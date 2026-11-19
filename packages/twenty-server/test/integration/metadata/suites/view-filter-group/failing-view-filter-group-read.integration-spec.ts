import { randomUUID } from 'node:crypto';

import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { deleteOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/delete-one-view-filter-group.util';
import { findOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/find-one-view-filter-group.util';
import { findViewFilterGroups } from 'test/integration/metadata/suites/view-filter-group/utils/find-view-filter-groups.util';
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

type ArrangedViewFilterGroup = {
  viewFilterGroupId: string;
  viewId: string;
  token?: string;
  cleanup: () => Promise<void>;
};

type TestContext = {
  arrange: () => Promise<ArrangedViewFilterGroup>;
};

const arrangeViewFilterGroup = async ({
  visibility = ViewVisibility.WORKSPACE,
  token,
  prepare = async () => ({}),
}: {
  visibility?: ViewVisibility;
  token?: string;
  prepare?: (
    arrangedViewFilterGroup: ArrangedViewFilterGroup,
  ) => Promise<Partial<ArrangedViewFilterGroup>>;
} = {}): Promise<ArrangedViewFilterGroup> => {
  const { viewId, childIdByChildName } = await createViewWithChildren({
    name: `View Filter Group read ${randomUUID().slice(0, 8)}`,
    visibility,
    token,
  });
  const arrangedViewFilterGroup = {
    viewFilterGroupId: childIdByChildName['view filter group'],
    viewId,
    cleanup: async () => {
      await destroyOneView({ viewId, expectToFail: false });
    },
  };

  try {
    return {
      ...arrangedViewFilterGroup,
      ...(await prepare(arrangedViewFilterGroup)),
    };
  } catch (error) {
    await arrangedViewFilterGroup.cleanup();

    throw error;
  }
};

const failingViewFilterGroupReadTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'when the view filter group does not exist',
    context: {
      arrange: async () => ({
        viewFilterGroupId: randomUUID(),
        viewId: randomUUID(),
        cleanup: async () => {},
      }),
    },
  },
  {
    title: 'when the view filter group is deleted',
    context: {
      arrange: () =>
        arrangeViewFilterGroup({
          prepare: async (arrangedViewFilterGroup) => {
            await deleteOneViewFilterGroup({
              id: arrangedViewFilterGroup.viewFilterGroupId,
              expectToFail: false,
            });

            return {};
          },
        }),
    },
  },
  {
    title: 'when the view filter group is soft-deleted',
    context: {
      arrange: () =>
        arrangeViewFilterGroup({
          prepare: async ({ viewFilterGroupId, cleanup }) => {
            await setViewRowDeletedAt({
              tableName: 'viewFilterGroup',
              id: viewFilterGroupId,
              deletedAt: new Date(),
            });

            return {
              cleanup: async () => {
                await setViewRowDeletedAt({
                  tableName: 'viewFilterGroup',
                  id: viewFilterGroupId,
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
    title: 'when the view of the view filter group is deleted',
    context: {
      arrange: () =>
        arrangeViewFilterGroup({
          prepare: async ({ viewId }) => {
            await deleteOneView({ viewId, expectToFail: false });

            return { cleanup: async () => {} };
          },
        }),
    },
  },
  {
    title: 'when the view of the view filter group is soft-deleted',
    context: {
      arrange: () =>
        arrangeViewFilterGroup({
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
      'when the view of the view filter group is unlisted and belongs to another user',
    context: {
      arrange: () =>
        arrangeViewFilterGroup({
          visibility: ViewVisibility.UNLISTED,
          token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
          prepare: async () => ({ token: APPLE_JONY_MEMBER_ACCESS_TOKEN }),
        }),
    },
  },
];

describe('View Filter Group read should fail', () => {
  it.each(eachTestingContextFilter(failingViewFilterGroupReadTestCases))(
    '$title',
    async ({ context }) => {
      const {
        viewFilterGroupId,
        viewId,
        token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
        cleanup,
      } = await context.arrange();

      try {
        const { errors } = await findOneViewFilterGroup({
          id: viewFilterGroupId,
          token,
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({
          errors,
          normalizeMessage: maskUuids,
        });

        const restResponse = await makeRestApiRequest({
          method: 'get',
          path: `/metadata/viewFilterGroups/${viewFilterGroupId}`,
          bearer: token,
        });

        expect(restResponse.status).toBe(404);
        expect(
          JSON.parse(maskUuids(JSON.stringify(restResponse.body))),
        ).toMatchSnapshot();

        const { data: viewFilterGroupsOfView } = await findViewFilterGroups({
          viewId,
          token,
          expectToFail: false,
        });
        const { data: allViewFilterGroups } = await findViewFilterGroups({
          token,
          expectToFail: false,
        });

        expect(
          viewFilterGroupsOfView.getViewFilterGroups.map(({ id }) => id),
        ).not.toContain(viewFilterGroupId);
        expect(
          allViewFilterGroups.getViewFilterGroups.map(({ id }) => id),
        ).not.toContain(viewFilterGroupId);

        for (const path of [
          `/metadata/viewFilterGroups?viewId=${viewId}`,
          '/metadata/viewFilterGroups',
        ]) {
          const pages = await findAllMetadataRestListPages({
            path,
            bearer: token,
          });

          expect(
            pages.flatMap(({ data }) => data.map(({ id }) => id)),
          ).not.toContain(viewFilterGroupId);
        }
      } finally {
        await cleanup();
      }
    },
  );
});
