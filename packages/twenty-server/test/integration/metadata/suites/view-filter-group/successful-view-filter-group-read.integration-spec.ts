import { randomUUID } from 'node:crypto';

import { setupApplicationTokensWithoutGrants } from 'test/integration/metadata/suites/application/utils/setup-application-tokens-without-grants.util';
import { createOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-view-filter-group.util';
import { findOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/find-one-view-filter-group.util';
import { findViewFilterGroups } from 'test/integration/metadata/suites/view-filter-group/utils/find-view-filter-groups.util';
import { createViewWithChildren } from 'test/integration/metadata/suites/view/utils/create-view-with-children.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { buildViewChildRestReadTestCases } from 'test/integration/rest/utils/build-view-child-rest-read-test-cases.util';
import { findAppleWorkspaceInviteHash } from 'test/integration/utils/find-apple-workspace-invite-hash.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { eachTestingContextFilter } from 'twenty-shared/testing';
import { ViewVisibility } from 'twenty-shared/types';

const VIEW_FILTER_GROUP_DTO_GQL_FIELDS = `
  id
  parentViewFilterGroupId
  logicalOperator
  positionInViewFilterGroup
  viewId
  workspaceId
  createdAt
  updatedAt
  deletedAt
`;

const VIEW_FILTER_GROUP_REST_READ_TEST_CASES =
  buildViewChildRestReadTestCases('viewFilterGroups');

describe('View Filter Group read should succeed', () => {
  let viewId: string;
  let viewFilterGroupId: string;
  let viewFilterId: string;

  beforeEach(async () => {
    const view = await createViewWithChildren({
      name: `View Filter Group read ${randomUUID().slice(0, 8)}`,
      visibility: ViewVisibility.WORKSPACE,
    });

    viewId = view.viewId;
    viewFilterGroupId = view.childIdByChildName['view filter group'];
    viewFilterId = view.childIdByChildName['view filter'];
  });

  afterEach(async () => {
    await destroyOneView({ viewId, expectToFail: false });
  });

  it('should find a view filter group by id', async () => {
    const { data } = await findOneViewFilterGroup({
      id: viewFilterGroupId,
      gqlFields: VIEW_FILTER_GROUP_DTO_GQL_FIELDS,
      expectToFail: false,
    });

    expect(data.getViewFilterGroup).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({ ...data.getViewFilterGroup }),
    );
  });

  it('should find a view filter group among the view filter groups of its view', async () => {
    const { data } = await findViewFilterGroups({
      viewId,
      gqlFields: VIEW_FILTER_GROUP_DTO_GQL_FIELDS,
      expectToFail: false,
    });
    const viewFilterGroup = data.getViewFilterGroups.find(
      ({ id }) => id === viewFilterGroupId,
    );

    jestExpectToBeDefined(viewFilterGroup);
    expect(viewFilterGroup).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({ ...viewFilterGroup }),
    );
  });

  it('should find a view filter group among all view filter groups', async () => {
    const { data } = await findViewFilterGroups({
      gqlFields: VIEW_FILTER_GROUP_DTO_GQL_FIELDS,
      expectToFail: false,
    });
    const viewFilterGroup = data.getViewFilterGroups.find(
      ({ id }) => id === viewFilterGroupId,
    );

    jestExpectToBeDefined(viewFilterGroup);
    expect(viewFilterGroup).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({ ...viewFilterGroup }),
    );
  });

  it('should list view filter groups by position, then id, without position last', async () => {
    const createdViewFilterGroupIds: string[] = [];

    for (const positionInViewFilterGroup of [2, 1, undefined, 0]) {
      const { data } = await createOneViewFilterGroup({
        expectToFail: false,
        gqlFields: 'id',
        input: { viewId, positionInViewFilterGroup },
      });

      createdViewFilterGroupIds.push(data.createViewFilterGroup.id);
    }

    const [last, middle, withoutPosition, sharedFirst] =
      createdViewFilterGroupIds;
    const viewFilterGroupIdsInOrder = [
      ...[viewFilterGroupId, sharedFirst].sort(),
      middle,
      last,
      withoutPosition,
    ];
    const { data: viewFilterGroupsOfView } = await findViewFilterGroups({
      viewId,
      expectToFail: false,
    });
    const { data: allViewFilterGroups } = await findViewFilterGroups({
      expectToFail: false,
    });

    expect(
      viewFilterGroupsOfView.getViewFilterGroups.map(({ id }) => id),
    ).toEqual(viewFilterGroupIdsInOrder);
    expect(
      allViewFilterGroups.getViewFilterGroups
        .map(({ id }) => id)
        .filter((id) => viewFilterGroupIdsInOrder.includes(id)),
    ).toEqual(viewFilterGroupIdsInOrder);
  });

  it.each(eachTestingContextFilter(VIEW_FILTER_GROUP_REST_READ_TEST_CASES))(
    'should return a view filter group on $title',
    async ({ context: { findRows } }) => {
      const viewFilterGroups = await findRows({
        id: viewFilterGroupId,
        viewId,
        bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });
      const viewFilterGroup = viewFilterGroups.find(
        ({ id }) => id === viewFilterGroupId,
      );

      jestExpectToBeDefined(viewFilterGroup);
      expect(viewFilterGroup.viewFilterIds).toEqual([viewFilterId]);
      expect(viewFilterGroup).toMatchSnapshot({
        ...extractRecordIdsAndDatesAsExpectAny(viewFilterGroup),
        viewFilterIds: [expect.any(String)],
        viewFilterUniversalIdentifiers: [expect.any(String)],
      });
    },
  );

  it('should return the same view filter group on REST to an API key and to an application whose role grants nothing', async () => {
    const application = await setupApplicationTokensWithoutGrants();

    try {
      const inviteHash = await findAppleWorkspaceInviteHash();

      for (const {
        context: { findRows },
      } of VIEW_FILTER_GROUP_REST_READ_TEST_CASES) {
        const viewFilterGroupReadByMember = (
          await findRows({
            id: viewFilterGroupId,
            viewId,
            bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
          })
        ).find(({ id }) => id === viewFilterGroupId);

        jestExpectToBeDefined(viewFilterGroupReadByMember);

        for (const bearer of [API_KEY_ACCESS_TOKEN, ...application.tokens]) {
          const viewFilterGroups = await findRows({
            id: viewFilterGroupId,
            viewId,
            bearer,
          });

          expect(
            viewFilterGroups.find(({ id }) => id === viewFilterGroupId),
          ).toEqual(viewFilterGroupReadByMember);
          expect(JSON.stringify(viewFilterGroups)).not.toContain(inviteHash);
        }
      }
    } finally {
      await application.cleanup();
    }
  });

  it('should find a view filter group of an unlisted view for the view creator', async () => {
    const token = APPLE_PHIL_GUEST_ACCESS_TOKEN;
    const unlistedView = await createViewWithChildren({
      name: `Unlisted view filter group read ${randomUUID().slice(0, 8)}`,
      visibility: ViewVisibility.UNLISTED,
      token,
    });
    const unlistedViewFilterGroupId =
      unlistedView.childIdByChildName['view filter group'];

    try {
      const { data } = await findOneViewFilterGroup({
        id: unlistedViewFilterGroupId,
        token,
        expectToFail: false,
      });

      expect(data.getViewFilterGroup.id).toBe(unlistedViewFilterGroupId);

      for (const {
        context: { findRows },
      } of VIEW_FILTER_GROUP_REST_READ_TEST_CASES) {
        const viewFilterGroups = await findRows({
          id: unlistedViewFilterGroupId,
          viewId: unlistedView.viewId,
          bearer: token,
        });

        expect(viewFilterGroups.map(({ id }) => id)).toContain(
          unlistedViewFilterGroupId,
        );
      }
    } finally {
      await destroyOneView({
        viewId: unlistedView.viewId,
        expectToFail: false,
      });
    }
  });
});
