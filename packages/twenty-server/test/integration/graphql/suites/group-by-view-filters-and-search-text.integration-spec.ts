import { randomUUID } from 'node:crypto';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { groupByOperationFactory } from 'test/integration/graphql/utils/group-by-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-view-filter-group.util';
import { destroyOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/destroy-one-view-filter-group.util';
import { createOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/create-one-view-filter.util';
import { destroyOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/destroy-one-view-filter.util';
import { createOneViewOnObject } from 'test/integration/metadata/suites/view/utils/create-one-view-on-object.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { updateOneView } from 'test/integration/metadata/suites/view/utils/update-one-view.util';
import { findFieldMetadataIdByName } from 'test/integration/utils/find-field-metadata-id-by-name.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type ViewOverridesRow = {
  anyFieldFilterValue: string | null;
  overrides: Record<string, unknown> | null;
};

// One person matches both the filter and the search text, one only the
// filter, one only the search text
const arrangePeople = async () => {
  const suffix = randomUUID().slice(0, 8);
  const filterValue = `filtered-${suffix}`;
  const searchText = `searched-${suffix}`;
  const keptJobTitle = `${filterValue} ${searchText}`;
  const personIds = [randomUUID(), randomUUID(), randomUUID()];

  const response = await makeGraphqlApiRequest(
    createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      data: [
        { id: personIds[0], jobTitle: keptJobTitle },
        { id: personIds[1], jobTitle: filterValue },
        { id: personIds[2], jobTitle: searchText },
      ],
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return {
    filterValue,
    searchText,
    keptJobTitle,
    personIds,
    destroyPeople: async () => {
      const destroyResponse = await makeGraphqlApiRequest(
        destroyManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: 'id',
          filter: { id: { in: personIds } },
        }),
      );

      expect(destroyResponse.body.errors).toBeUndefined();
    },
  };
};

const createJobTitleViewFilter = async ({
  viewId,
  value,
}: {
  viewId: string;
  value: string;
}): Promise<{ viewFilterGroupId: string; viewFilterId: string }> => {
  const { data: viewFilterGroupData, errors: viewFilterGroupErrors } =
    await createOneViewFilterGroup({
      expectToFail: false,
      gqlFields: 'id',
      input: {
        viewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
        positionInViewFilterGroup: 0,
      },
    });

  expect(viewFilterGroupErrors).toBeUndefined();

  const viewFilterGroupId = viewFilterGroupData.createViewFilterGroup.id;

  try {
    const { data: viewFilterData, errors: viewFilterErrors } =
      await createOneViewFilter({
        expectToFail: false,
        gqlFields: 'id',
        input: {
          viewId,
          viewFilterGroupId,
          fieldMetadataId: await findFieldMetadataIdByName({
            objectMetadataId: await findObjectMetadataIdByName('person'),
            fieldName: 'jobTitle',
          }),
          operand: ViewFilterOperand.CONTAINS,
          value,
          positionInViewFilterGroup: 0,
        },
      });

    expect(viewFilterErrors).toBeUndefined();

    return {
      viewFilterGroupId,
      viewFilterId: viewFilterData.createViewFilter.id,
    };
  } catch (error) {
    await destroyOneViewFilterGroup({
      id: viewFilterGroupId,
      expectToFail: false,
    });
    throw error;
  }
};

// One failed step must not skip the restore of the seeded view
const runCleanupSteps = async (cleanupSteps: (() => Promise<unknown>)[]) => {
  const errors: unknown[] = [];

  for (const cleanupStep of cleanupSteps) {
    try {
      await cleanupStep();
    } catch (error) {
      errors.push(error);
    }
  }

  if (isNonEmptyArray(errors)) {
    throw errors[0];
  }
};

const findGroupedJobTitles = async ({
  viewId,
  personIds,
}: {
  viewId: string;
  personIds: string[];
}): Promise<string[]> => {
  const response = await makeGraphqlApiRequest(
    groupByOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      groupBy: [{ jobTitle: true }],
      filter: { id: { in: personIds } },
      viewId,
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.peopleGroupBy.map(
    ({ groupByDimensionValues }: { groupByDimensionValues: string[] }) =>
      groupByDimensionValues[0],
  );
};

const findViewOverridesRow = async (
  viewId: string,
): Promise<ViewOverridesRow> => {
  const [viewOverridesRow] = await globalThis.testDataSource.query(
    `SELECT "anyFieldFilterValue", overrides FROM core."view" WHERE id = $1`,
    [viewId],
  );

  return viewOverridesRow;
};

describe('group by with a view holding filters and a search text (integration)', () => {
  it('should apply both the view filters and the view search text', async () => {
    const people = await arrangePeople();
    let viewId: string | undefined;

    try {
      viewId = await createOneViewOnObject({
        objectNameSingular: 'person',
        input: {
          name: `Filters and search text ${randomUUID().slice(0, 8)}`,
          anyFieldFilterValue: people.searchText,
        },
      });
      await createJobTitleViewFilter({ viewId, value: people.filterValue });

      expect(
        await findGroupedJobTitles({ viewId, personIds: people.personIds }),
      ).toEqual([people.keptJobTitle]);
    } finally {
      await runCleanupSteps([
        async () => {
          if (isDefined(viewId)) {
            await destroyOneView({ viewId, expectToFail: false });
          }
        },
        people.destroyPeople,
      ]);
    }
  });

  it('should apply a search text stored as an override on a view owned by another application', async () => {
    const [{ id: standardViewId }] = await globalThis.testDataSource.query(
      `SELECT id FROM core."view"
        WHERE "workspaceId" = $1 AND "objectMetadataId" = $2
          AND key = 'INDEX' AND "deletedAt" IS NULL`,
      [SEED_APPLE_WORKSPACE_ID, await findObjectMetadataIdByName('person')],
    );
    const initialViewOverridesRow = await findViewOverridesRow(standardViewId);
    const people = await arrangePeople();
    let createdViewFilter:
      | { viewFilterGroupId: string; viewFilterId: string }
      | undefined;

    try {
      const { errors } = await updateOneView({
        viewId: standardViewId,
        input: {
          id: standardViewId,
          anyFieldFilterValue: people.searchText,
        },
        gqlFields: 'id',
        expectToFail: false,
      });

      expect(errors).toBeUndefined();

      const viewOverridesRow = await findViewOverridesRow(standardViewId);

      expect(viewOverridesRow.anyFieldFilterValue).toBe(
        initialViewOverridesRow.anyFieldFilterValue,
      );
      expect(JSON.stringify(viewOverridesRow.overrides)).toContain(
        people.searchText,
      );

      createdViewFilter = await createJobTitleViewFilter({
        viewId: standardViewId,
        value: people.filterValue,
      });

      expect(
        await findGroupedJobTitles({
          viewId: standardViewId,
          personIds: people.personIds,
        }),
      ).toEqual([people.keptJobTitle]);
    } finally {
      await runCleanupSteps([
        async () => {
          await globalThis.testDataSource.query(
            `UPDATE core."view" SET overrides = $2 WHERE id = $1`,
            [standardViewId, initialViewOverridesRow.overrides],
          );
          await getAppProviderByClassName<WorkspaceCacheService>(
            'WorkspaceCacheService',
          ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['flatViewMaps']);
        },
        async () => {
          if (isDefined(createdViewFilter)) {
            await destroyOneViewFilter({
              input: { id: createdViewFilter.viewFilterId },
              expectToFail: false,
            });
          }
        },
        async () => {
          if (isDefined(createdViewFilter)) {
            await destroyOneViewFilterGroup({
              id: createdViewFilter.viewFilterGroupId,
              expectToFail: false,
            });
          }
        },
        people.destroyPeople,
      ]);
    }
  });
});
