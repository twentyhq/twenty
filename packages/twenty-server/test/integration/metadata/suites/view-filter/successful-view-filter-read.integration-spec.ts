import { randomUUID } from 'node:crypto';

import { setupApplicationTokensWithoutGrants } from 'test/integration/metadata/suites/application/utils/setup-application-tokens-without-grants.util';
import { createOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/create-one-view-filter.util';
import { findOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/find-one-view-filter.util';
import { findViewFilters } from 'test/integration/metadata/suites/view-filter/utils/find-view-filters.util';
import { createViewWithChildren } from 'test/integration/metadata/suites/view/utils/create-view-with-children.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { buildViewChildRestReadTestCases } from 'test/integration/rest/utils/build-view-child-rest-read-test-cases.util';
import { findAppleWorkspaceInviteHash } from 'test/integration/utils/find-apple-workspace-invite-hash.util';
import { findFieldMetadataIdByName } from 'test/integration/utils/find-field-metadata-id-by-name.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { eachTestingContextFilter } from 'twenty-shared/testing';
import { ViewFilterOperand, ViewVisibility } from 'twenty-shared/types';

const VIEW_FILTER_DTO_GQL_FIELDS = `
  id
  fieldMetadataId
  operand
  value
  viewFilterGroupId
  positionInViewFilterGroup
  subFieldName
  relationTargetFieldMetadataId
  viewId
  workspaceId
  createdAt
  updatedAt
  deletedAt
`;

const VIEW_FILTER_REST_READ_TEST_CASES =
  buildViewChildRestReadTestCases('viewFilters');

describe('View Filter read should succeed', () => {
  let viewId: string;
  let viewFilterId: string;

  beforeEach(async () => {
    const view = await createViewWithChildren({
      name: `View Filter read ${randomUUID().slice(0, 8)}`,
      visibility: ViewVisibility.WORKSPACE,
    });

    viewId = view.viewId;
    viewFilterId = view.childIdByChildName['view filter'];
  });

  afterEach(async () => {
    await destroyOneView({ viewId, expectToFail: false });
  });

  it('should find a view filter by id', async () => {
    const { data } = await findOneViewFilter({
      id: viewFilterId,
      gqlFields: VIEW_FILTER_DTO_GQL_FIELDS,
      expectToFail: false,
    });

    expect(data.getViewFilter).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({ ...data.getViewFilter }),
    );
  });

  it('should find a view filter among the view filters of its view', async () => {
    const { data } = await findViewFilters({
      viewId,
      gqlFields: VIEW_FILTER_DTO_GQL_FIELDS,
      expectToFail: false,
    });
    const viewFilter = data.getViewFilters.find(
      ({ id }) => id === viewFilterId,
    );

    jestExpectToBeDefined(viewFilter);
    expect(viewFilter).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({ ...viewFilter }),
    );
  });

  it('should find a view filter among all view filters', async () => {
    const { data } = await findViewFilters({
      gqlFields: VIEW_FILTER_DTO_GQL_FIELDS,
      expectToFail: false,
    });
    const viewFilter = data.getViewFilters.find(
      ({ id }) => id === viewFilterId,
    );

    jestExpectToBeDefined(viewFilter);
    expect(viewFilter).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({ ...viewFilter }),
    );
  });

  it('should list view filters by position, then id, without position last', async () => {
    const fieldMetadataId = await findFieldMetadataIdByName({
      objectMetadataId: await findObjectMetadataIdByName('opportunity'),
      fieldName: 'name',
    });
    const createdViewFilterIds: string[] = [];

    for (const positionInViewFilterGroup of [2, 1, undefined, 0]) {
      const { data } = await createOneViewFilter({
        expectToFail: false,
        gqlFields: 'id',
        input: {
          viewId,
          fieldMetadataId,
          operand: ViewFilterOperand.CONTAINS,
          value: 'ordered',
          positionInViewFilterGroup,
        },
      });

      createdViewFilterIds.push(data.createViewFilter.id);
    }

    const [last, middle, withoutPosition, sharedFirst] = createdViewFilterIds;
    const viewFilterIdsInOrder = [
      ...[viewFilterId, sharedFirst].sort(),
      middle,
      last,
      withoutPosition,
    ];
    const { data: viewFiltersOfView } = await findViewFilters({
      viewId,
      expectToFail: false,
    });
    const { data: allViewFilters } = await findViewFilters({
      expectToFail: false,
    });

    expect(viewFiltersOfView.getViewFilters.map(({ id }) => id)).toEqual(
      viewFilterIdsInOrder,
    );
    expect(
      allViewFilters.getViewFilters
        .map(({ id }) => id)
        .filter((id) => viewFilterIdsInOrder.includes(id)),
    ).toEqual(viewFilterIdsInOrder);
  });

  it.each(eachTestingContextFilter(VIEW_FILTER_REST_READ_TEST_CASES))(
    'should return a view filter on $title',
    async ({ context: { findRows } }) => {
      const viewFilters = await findRows({
        id: viewFilterId,
        viewId,
        bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });
      const viewFilter = viewFilters.find(({ id }) => id === viewFilterId);

      jestExpectToBeDefined(viewFilter);
      expect(viewFilter).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(viewFilter),
      );
    },
  );

  it('should return the same view filter on REST to an API key and to an application whose role grants nothing', async () => {
    const application = await setupApplicationTokensWithoutGrants();

    try {
      const inviteHash = await findAppleWorkspaceInviteHash();

      for (const {
        context: { findRows },
      } of VIEW_FILTER_REST_READ_TEST_CASES) {
        const viewFilterReadByMember = (
          await findRows({
            id: viewFilterId,
            viewId,
            bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
          })
        ).find(({ id }) => id === viewFilterId);

        jestExpectToBeDefined(viewFilterReadByMember);

        for (const bearer of [API_KEY_ACCESS_TOKEN, ...application.tokens]) {
          const viewFilters = await findRows({
            id: viewFilterId,
            viewId,
            bearer,
          });

          expect(viewFilters.find(({ id }) => id === viewFilterId)).toEqual(
            viewFilterReadByMember,
          );
          expect(JSON.stringify(viewFilters)).not.toContain(inviteHash);
        }
      }
    } finally {
      await application.cleanup();
    }
  });

  it('should find a view filter of an unlisted view for the view creator', async () => {
    const token = APPLE_PHIL_GUEST_ACCESS_TOKEN;
    const unlistedView = await createViewWithChildren({
      name: `Unlisted view filter read ${randomUUID().slice(0, 8)}`,
      visibility: ViewVisibility.UNLISTED,
      token,
    });
    const unlistedViewFilterId = unlistedView.childIdByChildName['view filter'];

    try {
      const { data } = await findOneViewFilter({
        id: unlistedViewFilterId,
        token,
        expectToFail: false,
      });

      expect(data.getViewFilter.id).toBe(unlistedViewFilterId);

      for (const {
        context: { findRows },
      } of VIEW_FILTER_REST_READ_TEST_CASES) {
        const viewFilters = await findRows({
          id: unlistedViewFilterId,
          viewId: unlistedView.viewId,
          bearer: token,
        });

        expect(viewFilters.map(({ id }) => id)).toContain(unlistedViewFilterId);
      }
    } finally {
      await destroyOneView({
        viewId: unlistedView.viewId,
        expectToFail: false,
      });
    }
  });
});
