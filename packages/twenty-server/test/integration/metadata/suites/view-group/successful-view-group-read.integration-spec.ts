import { randomUUID } from 'node:crypto';

import { setupApplicationTokensWithoutGrants } from 'test/integration/metadata/suites/application/utils/setup-application-tokens-without-grants.util';
import { findOneViewGroup } from 'test/integration/metadata/suites/view-group/utils/find-one-view-group.util';
import { findViewGroups } from 'test/integration/metadata/suites/view-group/utils/find-view-groups.util';
import { updateOneViewGroup } from 'test/integration/metadata/suites/view-group/utils/update-one-view-group.util';
import { createViewWithChildren } from 'test/integration/metadata/suites/view/utils/create-view-with-children.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { buildViewChildRestReadTestCases } from 'test/integration/rest/utils/build-view-child-rest-read-test-cases.util';
import { findAppleWorkspaceInviteHash } from 'test/integration/utils/find-apple-workspace-invite-hash.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { eachTestingContextFilter } from 'twenty-shared/testing';
import { ViewVisibility } from 'twenty-shared/types';

const VIEW_GROUP_DTO_GQL_FIELDS = `
  id
  isVisible
  fieldValue
  position
  viewId
  workspaceId
  createdAt
  updatedAt
  deletedAt
`;

const VIEW_GROUP_REST_READ_TEST_CASES =
  buildViewChildRestReadTestCases('viewGroups');

describe('View Group read should succeed', () => {
  let viewId: string;
  let viewGroupId: string;

  beforeEach(async () => {
    const view = await createViewWithChildren({
      name: `View Group read ${randomUUID().slice(0, 8)}`,
      visibility: ViewVisibility.WORKSPACE,
    });

    viewId = view.viewId;
    viewGroupId = view.childIdByChildName['view group'];
  });

  afterEach(async () => {
    await destroyOneView({ viewId, expectToFail: false });
  });

  it('should find a view group by id', async () => {
    const { data } = await findOneViewGroup({
      id: viewGroupId,
      gqlFields: VIEW_GROUP_DTO_GQL_FIELDS,
      expectToFail: false,
    });

    expect(data.getViewGroup).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({ ...data.getViewGroup }),
    );
  });

  it('should find a view group among the view groups of its view', async () => {
    const { data } = await findViewGroups({
      viewId,
      gqlFields: VIEW_GROUP_DTO_GQL_FIELDS,
      expectToFail: false,
    });
    const viewGroup = data.getViewGroups.find(({ id }) => id === viewGroupId);

    jestExpectToBeDefined(viewGroup);
    expect(viewGroup).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({ ...viewGroup }),
    );
  });

  it('should find a view group among all view groups', async () => {
    const { data } = await findViewGroups({
      gqlFields: VIEW_GROUP_DTO_GQL_FIELDS,
      expectToFail: false,
    });
    const viewGroup = data.getViewGroups.find(({ id }) => id === viewGroupId);

    jestExpectToBeDefined(viewGroup);
    expect(viewGroup).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({ ...viewGroup }),
    );
  });

  it('should list view groups by position', async () => {
    const { data: viewGroupsBeforeReordering } = await findViewGroups({
      viewId,
      expectToFail: false,
    });
    const viewGroupIdsInOrder = viewGroupsBeforeReordering.getViewGroups
      .map(({ id }) => id)
      .reverse();

    expect(viewGroupIdsInOrder.length).toBeGreaterThan(1);

    for (const [position, id] of viewGroupIdsInOrder.entries()) {
      await updateOneViewGroup({
        expectToFail: false,
        gqlFields: 'id',
        input: { id, update: { position } },
      });
    }
    const { data: viewGroupsOfView } = await findViewGroups({
      viewId,
      expectToFail: false,
    });
    const { data: allViewGroups } = await findViewGroups({
      expectToFail: false,
    });

    expect(viewGroupsOfView.getViewGroups.map(({ id }) => id)).toEqual(
      viewGroupIdsInOrder,
    );
    expect(
      allViewGroups.getViewGroups
        .map(({ id }) => id)
        .filter((id) => viewGroupIdsInOrder.includes(id)),
    ).toEqual(viewGroupIdsInOrder);
  });

  it.each(eachTestingContextFilter(VIEW_GROUP_REST_READ_TEST_CASES))(
    'should return a view group on $title',
    async ({ context: { findRows } }) => {
      const viewGroups = await findRows({
        id: viewGroupId,
        viewId,
        bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });
      const viewGroup = viewGroups.find(({ id }) => id === viewGroupId);

      jestExpectToBeDefined(viewGroup);
      expect(viewGroup).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(viewGroup),
      );
    },
  );

  it('should return the same view group on REST to an API key and to an application whose role grants nothing', async () => {
    const application = await setupApplicationTokensWithoutGrants();

    try {
      const inviteHash = await findAppleWorkspaceInviteHash();

      for (const {
        context: { findRows },
      } of VIEW_GROUP_REST_READ_TEST_CASES) {
        const viewGroupReadByMember = (
          await findRows({
            id: viewGroupId,
            viewId,
            bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
          })
        ).find(({ id }) => id === viewGroupId);

        jestExpectToBeDefined(viewGroupReadByMember);

        for (const bearer of [API_KEY_ACCESS_TOKEN, ...application.tokens]) {
          const viewGroups = await findRows({
            id: viewGroupId,
            viewId,
            bearer,
          });

          expect(viewGroups.find(({ id }) => id === viewGroupId)).toEqual(
            viewGroupReadByMember,
          );
          expect(JSON.stringify(viewGroups)).not.toContain(inviteHash);
        }
      }
    } finally {
      await application.cleanup();
    }
  });

  it('should find a view group of an unlisted view for the view creator', async () => {
    const token = APPLE_PHIL_GUEST_ACCESS_TOKEN;
    const unlistedView = await createViewWithChildren({
      name: `Unlisted view group read ${randomUUID().slice(0, 8)}`,
      visibility: ViewVisibility.UNLISTED,
      token,
    });
    const unlistedViewGroupId = unlistedView.childIdByChildName['view group'];

    try {
      const { data } = await findOneViewGroup({
        id: unlistedViewGroupId,
        token,
        expectToFail: false,
      });

      expect(data.getViewGroup.id).toBe(unlistedViewGroupId);

      for (const {
        context: { findRows },
      } of VIEW_GROUP_REST_READ_TEST_CASES) {
        const viewGroups = await findRows({
          id: unlistedViewGroupId,
          viewId: unlistedView.viewId,
          bearer: token,
        });

        expect(viewGroups.map(({ id }) => id)).toContain(unlistedViewGroupId);
      }
    } finally {
      await destroyOneView({
        viewId: unlistedView.viewId,
        expectToFail: false,
      });
    }
  });
});
