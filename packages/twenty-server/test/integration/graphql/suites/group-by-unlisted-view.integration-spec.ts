import { randomUUID } from 'node:crypto';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { groupByOperationFactory } from 'test/integration/graphql/utils/group-by-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-view-filter-group.util';
import { createOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/create-one-view-filter.util';
import { createOneViewOnObject } from 'test/integration/metadata/suites/view/utils/create-one-view-on-object.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { findFieldMetadataIdByName } from 'test/integration/utils/find-field-metadata-id-by-name.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import {
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewVisibility,
} from 'twenty-shared/types';

const KEPT_PERSON_ID = randomUUID();
const EXCLUDED_PERSON_ID = randomUUID();
const PERSON_IDS = [KEPT_PERSON_ID, EXCLUDED_PERSON_ID];
const KEPT_JOB_TITLE = 'Unlisted view kept job title';
const EXCLUDED_JOB_TITLE = 'Unlisted view excluded job title';

describe('group by with an unlisted view (integration)', () => {
  let unlistedViewId: string;
  let unlistedSearchViewId: string;

  const findGroupedJobTitles = async ({
    viewId,
    token,
  }: {
    viewId: string;
    token: string;
  }): Promise<string[]> => {
    const response = await makeGraphqlApiRequest(
      groupByOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        groupBy: [{ jobTitle: true }],
        filter: { id: { in: PERSON_IDS } },
        viewId,
      }),
      token,
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.peopleGroupBy
      .map(
        ({ groupByDimensionValues }: { groupByDimensionValues: string[] }) =>
          groupByDimensionValues[0],
      )
      .sort();
  };

  beforeAll(async () => {
    const createdPeople = await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        data: [
          { id: KEPT_PERSON_ID, jobTitle: KEPT_JOB_TITLE },
          { id: EXCLUDED_PERSON_ID, jobTitle: EXCLUDED_JOB_TITLE },
        ],
      }),
    );

    expect(createdPeople.body.errors).toBeUndefined();

    const token = APPLE_JONY_MEMBER_ACCESS_TOKEN;

    unlistedViewId = await createOneViewOnObject({
      objectNameSingular: 'person',
      input: {
        name: 'Member private people',
        visibility: ViewVisibility.UNLISTED,
      },
      token,
    });
    unlistedSearchViewId = await createOneViewOnObject({
      objectNameSingular: 'person',
      input: {
        name: 'Member private people search',
        visibility: ViewVisibility.UNLISTED,
        anyFieldFilterValue: KEPT_JOB_TITLE,
      },
      token,
    });

    const { data } = await createOneViewFilterGroup({
      expectToFail: false,
      gqlFields: 'id',
      token,
      input: {
        viewId: unlistedViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
        positionInViewFilterGroup: 0,
      },
    });

    await createOneViewFilter({
      expectToFail: false,
      gqlFields: 'id',
      token,
      input: {
        viewId: unlistedViewId,
        viewFilterGroupId: data.createViewFilterGroup.id,
        fieldMetadataId: await findFieldMetadataIdByName({
          objectMetadataId: await findObjectMetadataIdByName('person'),
          fieldName: 'jobTitle',
        }),
        operand: ViewFilterOperand.CONTAINS,
        value: KEPT_JOB_TITLE,
        positionInViewFilterGroup: 0,
      },
    });
  });

  afterAll(async () => {
    for (const viewId of [unlistedViewId, unlistedSearchViewId]) {
      await destroyOneView({ viewId });
    }

    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: { id: { in: PERSON_IDS } },
      }),
    );
  });

  describe.each([
    { viewPart: 'filters', getViewId: () => unlistedViewId },
    { viewPart: 'search text', getViewId: () => unlistedSearchViewId },
  ])('view $viewPart', ({ getViewId }) => {
    it('should apply to the view creator', async () => {
      expect(
        await findGroupedJobTitles({
          viewId: getViewId(),
          token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        }),
      ).toEqual([KEPT_JOB_TITLE]);
    });

    it.each([
      { caller: 'an admin', getToken: () => APPLE_JANE_ADMIN_ACCESS_TOKEN },
      { caller: 'an API key', getToken: () => API_KEY_ACCESS_TOKEN },
    ])(
      'should be ignored for $caller, as for a missing view',
      async ({ getToken }) => {
        expect(
          await findGroupedJobTitles({
            viewId: getViewId(),
            token: getToken(),
          }),
        ).toEqual([EXCLUDED_JOB_TITLE, KEPT_JOB_TITLE].sort());
      },
    );
  });
});
