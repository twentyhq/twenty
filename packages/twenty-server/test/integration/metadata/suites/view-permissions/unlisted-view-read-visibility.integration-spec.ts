import { randomUUID } from 'node:crypto';

import { getViewNonCreatorCallers } from 'test/integration/metadata/suites/view-permissions/utils/get-view-non-creator-callers.util';
import { createOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-view-filter-group.util';
import { createOneViewOnObject } from 'test/integration/metadata/suites/view/utils/create-one-view-on-object.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { findViewChildIds } from 'test/integration/metadata/suites/view/utils/find-view-child-ids.util';
import { findViewChild } from 'test/integration/metadata/suites/view/utils/find-view-child.util';
import { findOneView } from 'test/integration/metadata/suites/view/utils/find-one-view.util';
import { findViewOwnership } from 'test/integration/metadata/suites/view/utils/find-view-ownership.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { updateOneView } from 'test/integration/metadata/suites/view/utils/update-one-view.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  ViewFilterGroupLogicalOperator,
  ViewVisibility,
} from 'twenty-shared/types';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const findViewOrErrorCode = async ({
  viewId,
  token,
}: {
  viewId: string;
  token: string;
}) => {
  const { data, errors } = await findOneView({
    viewId,
    gqlFields: 'id',
    token,
  });

  return {
    viewId: data?.getView?.id ?? null,
    errorCode: errors?.[0]?.extensions?.code,
  };
};

const NOT_FOUND_RESULT = { viewId: null, errorCode: ErrorCode.NOT_FOUND };

const findViewIds = async (token: string) => {
  const { data } = await findViews({
    gqlFields: 'id',
    expectToFail: false,
    token,
  });

  return data.getViews.map(({ id }) => id);
};

const findViewStatusWithRestApi = async ({
  viewId,
  token,
}: {
  viewId: string;
  token: string;
}) => {
  const response = await makeRestApiRequest({
    method: 'get',
    path: `/metadata/views/${viewId}`,
    bearer: token,
  });

  return response.status;
};

describe('unlisted view read visibility (integration)', () => {
  let unlistedViewId: string;
  let ownerlessViewId: string;
  let ownerlessViewFilterGroupId: string;

  beforeAll(async () => {
    unlistedViewId = await createOneViewOnObject({
      objectNameSingular: 'company',
      input: {
        name: 'Guest private companies read',
        visibility: ViewVisibility.UNLISTED,
      },
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
    });

    ownerlessViewId = await createOneViewOnObject({
      objectNameSingular: 'company',
      input: {
        name: 'Ownerless companies read',
        visibility: ViewVisibility.WORKSPACE,
      },
      token: API_KEY_ACCESS_TOKEN,
    });

    const { data } = await createOneViewFilterGroup({
      expectToFail: false,
      gqlFields: 'id',
      token: API_KEY_ACCESS_TOKEN,
      input: {
        viewId: ownerlessViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
        positionInViewFilterGroup: 0,
      },
    });

    ownerlessViewFilterGroupId = data.createViewFilterGroup.id;

    await updateOneView({
      viewId: ownerlessViewId,
      input: { id: ownerlessViewId, visibility: ViewVisibility.UNLISTED },
      gqlFields: 'id',
      expectToFail: false,
      token: API_KEY_ACCESS_TOKEN,
    });
  });

  afterAll(async () => {
    for (const viewId of [unlistedViewId, ownerlessViewId]) {
      await destroyOneView({ viewId });
    }
  });

  it('should return an unlisted view to its creator', async () => {
    const token = APPLE_PHIL_GUEST_ACCESS_TOKEN;

    expect(
      await findViewOrErrorCode({ viewId: unlistedViewId, token }),
    ).toEqual({ viewId: unlistedViewId, errorCode: undefined });
    expect(await findViewIds(token)).toContain(unlistedViewId);
    expect(
      await findViewStatusWithRestApi({ viewId: unlistedViewId, token }),
    ).toBe(200);
  });

  it.each(getViewNonCreatorCallers())(
    'should behave as a missing view for $caller',
    async ({ token }) => {
      expect(
        await findViewOrErrorCode({ viewId: unlistedViewId, token }),
      ).toEqual(NOT_FOUND_RESULT);
      expect(
        await findViewOrErrorCode({ viewId: randomUUID(), token }),
      ).toEqual(NOT_FOUND_RESULT);
      expect(await findViewIds(token)).not.toContain(unlistedViewId);
      expect(
        await findViewStatusWithRestApi({ viewId: unlistedViewId, token }),
      ).toBe(404);
    },
  );

  it.each([
    { caller: 'a guest', token: APPLE_PHIL_GUEST_ACCESS_TOKEN },
    ...getViewNonCreatorCallers(),
  ])(
    'should hide an unlisted view without a creator and its children from $caller',
    async ({ token }) => {
      expect(await findViewOwnership(ownerlessViewId)).toEqual({
        visibility: ViewVisibility.UNLISTED,
        createdByUserWorkspaceId: null,
      });
      expect(
        await findViewOrErrorCode({ viewId: ownerlessViewId, token }),
      ).toEqual(NOT_FOUND_RESULT);
      expect(await findViewIds(token)).not.toContain(ownerlessViewId);
      expect(
        await findViewStatusWithRestApi({ viewId: ownerlessViewId, token }),
      ).toBe(404);
      expect(
        await findViewChildIds({
          listQueryName: 'getViewFilterGroups',
          viewId: ownerlessViewId,
          token,
        }),
      ).toEqual([]);
      expect(
        await findViewChild({
          oneQueryName: 'getViewFilterGroup',
          childId: ownerlessViewFilterGroupId,
          token,
        }),
      ).toEqual({ child: null, errorCode: ErrorCode.NOT_FOUND });
    },
  );
});
