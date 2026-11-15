import { randomUUID } from 'node:crypto';

import {
  VIEW_CHILD_LIST_ALL_READS,
  VIEW_CHILD_READS,
  VIEW_CHILD_RELATION_NAMES,
  VIEW_CHILD_REST_READS,
  VIEW_WITH_CHILD_IDS_GQL_FIELDS,
} from 'test/integration/constants/view-child-reads.constants';
import { getViewNonCreatorCallers } from 'test/integration/metadata/suites/view-permissions/utils/get-view-non-creator-callers.util';
import { createViewWithChildren } from 'test/integration/metadata/suites/view/utils/create-view-with-children.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { findOneView } from 'test/integration/metadata/suites/view/utils/find-one-view.util';
import { findViewChildIds } from 'test/integration/metadata/suites/view/utils/find-view-child-ids.util';
import { findViewChild } from 'test/integration/metadata/suites/view/utils/find-view-child.util';
import { updateOneView } from 'test/integration/metadata/suites/view/utils/update-one-view.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { ViewVisibility } from 'twenty-shared/types';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

describe('unlisted view children read visibility (integration)', () => {
  let unlistedViewId: string;
  let childIdByChildName: Record<string, string>;

  const findChildrenWithRestApi = ({
    restPath,
    token,
  }: {
    restPath: string;
    token: string;
  }) =>
    makeRestApiRequest({
      method: 'get',
      path: `/metadata/${restPath}?viewId=${unlistedViewId}`,
      bearer: token,
    });

  const findChildWithRestApi = ({
    restPath,
    childName,
    token,
  }: {
    restPath: string;
    childName: string;
    token: string;
  }) =>
    makeRestApiRequest({
      method: 'get',
      path: `/metadata/${restPath}/${childIdByChildName[childName]}`,
      bearer: token,
    });

  beforeAll(async () => {
    ({ viewId: unlistedViewId, childIdByChildName } =
      await createViewWithChildren({
        name: 'Guest private opportunities',
        visibility: ViewVisibility.UNLISTED,
        token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
      }));
  });

  afterAll(async () => {
    await destroyOneView({ viewId: unlistedViewId });
  });

  describe.each(VIEW_CHILD_READS)(
    '$childName',
    ({ childName, listQueryName, oneQueryName }) => {
      it('should return the child to the view creator', async () => {
        const childId = childIdByChildName[childName];
        const token = APPLE_PHIL_GUEST_ACCESS_TOKEN;

        expect(
          await findViewChildIds({
            listQueryName,
            viewId: unlistedViewId,
            token,
          }),
        ).toContain(childId);
        expect(await findViewChild({ oneQueryName, childId, token })).toEqual({
          child: { id: childId },
          errorCode: undefined,
        });
      });

      it.each(getViewNonCreatorCallers())(
        'should behave as a missing child for $caller',
        async ({ token }) => {
          expect(
            await findViewChildIds({
              listQueryName,
              viewId: unlistedViewId,
              token,
            }),
          ).toEqual([]);
          expect(
            await findViewChild({
              oneQueryName,
              childId: childIdByChildName[childName],
              token,
            }),
          ).toEqual(
            await findViewChild({ oneQueryName, childId: randomUUID(), token }),
          );
          expect(
            await findViewChild({
              oneQueryName,
              childId: childIdByChildName[childName],
              token,
            }),
          ).toEqual({ child: null, errorCode: ErrorCode.NOT_FOUND });
        },
      );
    },
  );

  describe.each(VIEW_CHILD_LIST_ALL_READS)(
    '$childName listed without a view',
    ({ childName, listQueryName }) => {
      it('should include the child for the view creator', async () => {
        expect(
          await findViewChildIds({
            listQueryName,
            token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
          }),
        ).toContain(childIdByChildName[childName]);
      });

      it.each(getViewNonCreatorCallers())(
        'should leave the child out for $caller',
        async ({ token }) => {
          expect(
            await findViewChildIds({ listQueryName, token }),
          ).not.toContain(childIdByChildName[childName]);
        },
      );
    },
  );

  describe.each(VIEW_CHILD_REST_READS)(
    '$childName through REST',
    ({ childName, restPath }) => {
      it('should return the child to the view creator', async () => {
        const token = APPLE_PHIL_GUEST_ACCESS_TOKEN;
        const listResponse = await findChildrenWithRestApi({ restPath, token });
        const oneResponse = await findChildWithRestApi({
          restPath,
          childName,
          token,
        });

        expect(
          listResponse.body.data.map(({ id }: { id: string }) => id),
        ).toContain(childIdByChildName[childName]);
        expect(oneResponse.body.id).toBe(childIdByChildName[childName]);
      });

      it.each(getViewNonCreatorCallers())(
        'should behave as a missing child for $caller',
        async ({ token }) => {
          const listResponse = await findChildrenWithRestApi({
            restPath,
            token,
          });
          const oneResponse = await findChildWithRestApi({
            restPath,
            childName,
            token,
          });

          expect(listResponse.status).toBe(200);
          expect(listResponse.body.data).toEqual([]);
          expect(listResponse.body.totalCount).toBe(0);
          expect(oneResponse.status).toBe(404);
        },
      );
    },
  );

  describe('children resolved from the view', () => {
    it('should resolve every child for the creator', async () => {
      const { data } = await findOneView({
        viewId: unlistedViewId,
        gqlFields: VIEW_WITH_CHILD_IDS_GQL_FIELDS,
        expectToFail: false,
        token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
      });

      expect(data.getView).toMatchObject(
        Object.fromEntries(
          VIEW_CHILD_RELATION_NAMES.map((relationName) => [
            relationName,
            expect.arrayContaining([{ id: expect.any(String) }]),
          ]),
        ),
      );
    });

    it('should resolve no child on the mutation response of a non-creator holding VIEWS', async () => {
      const { data } = await updateOneView({
        viewId: unlistedViewId,
        gqlFields: VIEW_WITH_CHILD_IDS_GQL_FIELDS,
        input: { id: unlistedViewId, icon: 'IconList' },
        expectToFail: false,
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });

      expect(data.updateView).toMatchObject(
        Object.fromEntries(
          VIEW_CHILD_RELATION_NAMES.map((relationName) => [relationName, []]),
        ),
      );
    });
  });
});
