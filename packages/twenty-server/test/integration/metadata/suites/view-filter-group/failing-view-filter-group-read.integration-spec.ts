import { randomUUID } from 'node:crypto';

import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { deleteOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/delete-one-view-filter-group.util';
import { findOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/find-one-view-filter-group.util';
import { findViewFilterGroups } from 'test/integration/metadata/suites/view-filter-group/utils/find-view-filter-groups.util';
import { createViewWithChildren } from 'test/integration/metadata/suites/view/utils/create-view-with-children.util';
import { deleteOneView } from 'test/integration/metadata/suites/view/utils/delete-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
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
}: {
  visibility?: ViewVisibility;
  token?: string;
} = {}): Promise<ArrangedViewFilterGroup> => {
  const { viewId, childIdByChildName } = await createViewWithChildren({
    name: `View Filter Group read ${randomUUID().slice(0, 8)}`,
    visibility,
    token,
  });

  return {
    viewFilterGroupId: childIdByChildName['view filter group'],
    viewId,
    // Does nothing once the case itself deleted the view
    cleanup: async () => {
      await destroyOneView({ viewId });
    },
  };
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
    title: 'when the view filter group is soft-deleted',
    context: {
      arrange: async () => {
        const arrangedViewFilterGroup = await arrangeViewFilterGroup();

        await deleteOneViewFilterGroup({
          id: arrangedViewFilterGroup.viewFilterGroupId,
          expectToFail: false,
        });

        return arrangedViewFilterGroup;
      },
    },
  },
  {
    title: 'when the view of the view filter group is deleted',
    context: {
      arrange: async () => {
        const arrangedViewFilterGroup = await arrangeViewFilterGroup();

        await deleteOneView({
          viewId: arrangedViewFilterGroup.viewId,
          expectToFail: false,
        });

        return arrangedViewFilterGroup;
      },
    },
  },
  {
    title:
      'when the view of the view filter group is unlisted and belongs to another user',
    context: {
      arrange: async () => ({
        ...(await arrangeViewFilterGroup({
          visibility: ViewVisibility.UNLISTED,
          token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
        })),
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
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
