import { randomUUID } from 'node:crypto';

import { setupApplicationTokensWithoutGrants } from 'test/integration/metadata/suites/application/utils/setup-application-tokens-without-grants.util';
import { createOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/create-one-view-sort.util';
import { findOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/find-one-view-sort.util';
import { findViewSorts } from 'test/integration/metadata/suites/view-sort/utils/find-view-sorts.util';
import { updateOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/update-one-view-sort.util';
import { createViewWithChildren } from 'test/integration/metadata/suites/view/utils/create-view-with-children.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { buildViewChildRestReadTestCases } from 'test/integration/rest/utils/build-view-child-rest-read-test-cases.util';
import { findAppleWorkspaceInviteHash } from 'test/integration/utils/find-apple-workspace-invite-hash.util';
import { findFieldMetadataIdByName } from 'test/integration/utils/find-field-metadata-id-by-name.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { eachTestingContextFilter } from 'twenty-shared/testing';
import { ViewSortDirection, ViewVisibility } from 'twenty-shared/types';

const VIEW_SORT_DTO_GQL_FIELDS = `
  id
  fieldMetadataId
  direction
  subFieldName
  relationTargetFieldMetadataId
  viewId
  workspaceId
  createdAt
  updatedAt
  deletedAt
`;

const VIEW_SORT_REST_READ_TEST_CASES =
  buildViewChildRestReadTestCases('viewSorts');

describe('View Sort read should succeed', () => {
  let viewId: string;
  let viewSortId: string;

  beforeEach(async () => {
    const view = await createViewWithChildren({
      name: `View Sort read ${randomUUID().slice(0, 8)}`,
      visibility: ViewVisibility.WORKSPACE,
    });

    viewId = view.viewId;
    viewSortId = view.childIdByChildName['view sort'];
  });

  afterEach(async () => {
    await destroyOneView({ viewId, expectToFail: false });
  });

  it('should find a view sort by id', async () => {
    const { data } = await findOneViewSort({
      id: viewSortId,
      gqlFields: VIEW_SORT_DTO_GQL_FIELDS,
      expectToFail: false,
    });

    expect(data.getViewSort).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({ ...data.getViewSort }),
    );
  });

  it('should find a view sort among the view sorts of its view', async () => {
    const { data } = await findViewSorts({
      viewId,
      gqlFields: VIEW_SORT_DTO_GQL_FIELDS,
      expectToFail: false,
    });
    const viewSort = data.getViewSorts.find(({ id }) => id === viewSortId);

    jestExpectToBeDefined(viewSort);
    expect(viewSort).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({ ...viewSort }),
    );
  });

  it('should find a view sort among all view sorts', async () => {
    const { data } = await findViewSorts({
      gqlFields: VIEW_SORT_DTO_GQL_FIELDS,
      expectToFail: false,
    });
    const viewSort = data.getViewSorts.find(({ id }) => id === viewSortId);

    jestExpectToBeDefined(viewSort);
    expect(viewSort).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({ ...viewSort }),
    );
  });

  it('should list view sorts by creation date', async () => {
    const objectMetadataId = await findObjectMetadataIdByName('opportunity');
    const viewSortIdsInOrder = [viewSortId];

    for (const fieldName of ['closeDate', 'stage']) {
      const { data } = await createOneViewSort({
        expectToFail: false,
        gqlFields: 'id',
        input: {
          viewId,
          fieldMetadataId: await findFieldMetadataIdByName({
            objectMetadataId,
            fieldName,
          }),
          direction: ViewSortDirection.DESC,
        },
      });

      viewSortIdsInOrder.push(data.createViewSort.id);
    }

    await updateOneViewSort({
      expectToFail: false,
      gqlFields: 'id',
      input: {
        id: viewSortId,
        update: { direction: ViewSortDirection.DESC },
      },
    });
    const { data: viewSortsOfView } = await findViewSorts({
      viewId,
      expectToFail: false,
    });
    const { data: allViewSorts } = await findViewSorts({
      expectToFail: false,
    });

    expect(viewSortsOfView.getViewSorts.map(({ id }) => id)).toEqual(
      viewSortIdsInOrder,
    );
    expect(
      allViewSorts.getViewSorts
        .map(({ id }) => id)
        .filter((id) => viewSortIdsInOrder.includes(id)),
    ).toEqual(viewSortIdsInOrder);
  });

  it.each(eachTestingContextFilter(VIEW_SORT_REST_READ_TEST_CASES))(
    'should return a view sort on $title',
    async ({ context: { findRows } }) => {
      const viewSorts = await findRows({
        id: viewSortId,
        viewId,
        bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });
      const viewSort = viewSorts.find(({ id }) => id === viewSortId);

      jestExpectToBeDefined(viewSort);
      expect(viewSort).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(viewSort),
      );
    },
  );

  it('should return the same view sort on REST to an API key and to an application whose role grants nothing', async () => {
    const application = await setupApplicationTokensWithoutGrants();

    try {
      const inviteHash = await findAppleWorkspaceInviteHash();

      for (const {
        context: { findRows },
      } of VIEW_SORT_REST_READ_TEST_CASES) {
        const viewSortReadByMember = (
          await findRows({
            id: viewSortId,
            viewId,
            bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
          })
        ).find(({ id }) => id === viewSortId);

        jestExpectToBeDefined(viewSortReadByMember);

        for (const bearer of [API_KEY_ACCESS_TOKEN, ...application.tokens]) {
          const viewSorts = await findRows({ id: viewSortId, viewId, bearer });

          expect(viewSorts.find(({ id }) => id === viewSortId)).toEqual(
            viewSortReadByMember,
          );
          expect(JSON.stringify(viewSorts)).not.toContain(inviteHash);
        }
      }
    } finally {
      await application.cleanup();
    }
  });

  it('should find a view sort of an unlisted view for the view creator', async () => {
    const token = APPLE_PHIL_GUEST_ACCESS_TOKEN;
    const unlistedView = await createViewWithChildren({
      name: `Unlisted view sort read ${randomUUID().slice(0, 8)}`,
      visibility: ViewVisibility.UNLISTED,
      token,
    });
    const unlistedViewSortId = unlistedView.childIdByChildName['view sort'];

    try {
      const { data } = await findOneViewSort({
        id: unlistedViewSortId,
        token,
        expectToFail: false,
      });

      expect(data.getViewSort.id).toBe(unlistedViewSortId);

      for (const {
        context: { findRows },
      } of VIEW_SORT_REST_READ_TEST_CASES) {
        const viewSorts = await findRows({
          id: unlistedViewSortId,
          viewId: unlistedView.viewId,
          bearer: token,
        });

        expect(viewSorts.map(({ id }) => id)).toContain(unlistedViewSortId);
      }
    } finally {
      await destroyOneView({
        viewId: unlistedView.viewId,
        expectToFail: false,
      });
    }
  });
});
