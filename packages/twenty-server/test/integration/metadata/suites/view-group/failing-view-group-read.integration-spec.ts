import { randomUUID } from 'node:crypto';

import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { deleteOneViewGroup } from 'test/integration/metadata/suites/view-group/utils/delete-one-view-group.util';
import { findOneViewGroup } from 'test/integration/metadata/suites/view-group/utils/find-one-view-group.util';
import { findViewGroups } from 'test/integration/metadata/suites/view-group/utils/find-view-groups.util';
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

type ArrangedViewGroup = {
  viewGroupId: string;
  viewId: string;
  token?: string;
  cleanup: () => Promise<void>;
};

type TestContext = {
  arrange: () => Promise<ArrangedViewGroup>;
};

const arrangeViewGroup = async ({
  visibility = ViewVisibility.WORKSPACE,
  token,
  prepare = async () => ({}),
}: {
  visibility?: ViewVisibility;
  token?: string;
  prepare?: (
    arrangedViewGroup: ArrangedViewGroup,
  ) => Promise<Partial<ArrangedViewGroup>>;
} = {}): Promise<ArrangedViewGroup> => {
  const { viewId, childIdByChildName } = await createViewWithChildren({
    name: `View Group read ${randomUUID().slice(0, 8)}`,
    visibility,
    token,
  });
  const arrangedViewGroup = {
    viewGroupId: childIdByChildName['view group'],
    viewId,
    cleanup: async () => {
      await destroyOneView({ viewId, expectToFail: false });
    },
  };

  try {
    return { ...arrangedViewGroup, ...(await prepare(arrangedViewGroup)) };
  } catch (error) {
    await arrangedViewGroup.cleanup();

    throw error;
  }
};

const failingViewGroupReadTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'when the view group does not exist',
    context: {
      arrange: async () => ({
        viewGroupId: randomUUID(),
        viewId: randomUUID(),
        cleanup: async () => {},
      }),
    },
  },
  {
    title: 'when the view group is deleted',
    context: {
      arrange: () =>
        arrangeViewGroup({
          prepare: async (arrangedViewGroup) => {
            await deleteOneViewGroup({
              input: { id: arrangedViewGroup.viewGroupId },
              expectToFail: false,
            });

            return {};
          },
        }),
    },
  },
  {
    title: 'when the view group is soft-deleted',
    context: {
      arrange: () =>
        arrangeViewGroup({
          prepare: async ({ viewGroupId, cleanup }) => {
            await setViewRowDeletedAt({
              tableName: 'viewGroup',
              id: viewGroupId,
              deletedAt: new Date(),
            });

            return {
              cleanup: async () => {
                await setViewRowDeletedAt({
                  tableName: 'viewGroup',
                  id: viewGroupId,
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
    title: 'when the view of the view group is deleted',
    context: {
      arrange: () =>
        arrangeViewGroup({
          prepare: async ({ viewId }) => {
            await deleteOneView({ viewId, expectToFail: false });

            return { cleanup: async () => {} };
          },
        }),
    },
  },
  {
    title: 'when the view of the view group is soft-deleted',
    context: {
      arrange: () =>
        arrangeViewGroup({
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
      'when the view of the view group is unlisted and belongs to another user',
    context: {
      arrange: () =>
        arrangeViewGroup({
          visibility: ViewVisibility.UNLISTED,
          token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
          prepare: async () => ({ token: APPLE_JONY_MEMBER_ACCESS_TOKEN }),
        }),
    },
  },
];

describe('View Group read should fail', () => {
  it.each(eachTestingContextFilter(failingViewGroupReadTestCases))(
    '$title',
    async ({ context }) => {
      const {
        viewGroupId,
        viewId,
        token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
        cleanup,
      } = await context.arrange();

      try {
        const { errors } = await findOneViewGroup({
          id: viewGroupId,
          token,
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({
          errors,
          normalizeMessage: maskUuids,
        });

        const restResponse = await makeRestApiRequest({
          method: 'get',
          path: `/metadata/viewGroups/${viewGroupId}`,
          bearer: token,
        });

        expect(restResponse.status).toBe(404);
        expect(
          JSON.parse(maskUuids(JSON.stringify(restResponse.body))),
        ).toMatchSnapshot();

        const { data: viewGroupsOfView } = await findViewGroups({
          viewId,
          token,
          expectToFail: false,
        });
        const { data: allViewGroups } = await findViewGroups({
          token,
          expectToFail: false,
        });

        expect(
          viewGroupsOfView.getViewGroups.map(({ id }) => id),
        ).not.toContain(viewGroupId);
        expect(allViewGroups.getViewGroups.map(({ id }) => id)).not.toContain(
          viewGroupId,
        );

        for (const path of [
          `/metadata/viewGroups?viewId=${viewId}`,
          '/metadata/viewGroups',
        ]) {
          const pages = await findAllMetadataRestListPages({
            path,
            bearer: token,
          });

          expect(
            pages.flatMap(({ data }) => data.map(({ id }) => id)),
          ).not.toContain(viewGroupId);
        }
      } finally {
        await cleanup();
      }
    },
  );
});
