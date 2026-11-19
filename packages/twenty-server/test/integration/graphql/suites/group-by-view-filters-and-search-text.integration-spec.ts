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
} from 'twenty-shared/types';

describe('group by with a view holding filters and a search text (integration)', () => {
  it('should apply both the view filters and the view search text', async () => {
    const token = randomUUID().slice(0, 8);
    const filterValue = `filtered-${token}`;
    const searchText = `searched-${token}`;
    const keptJobTitle = `${filterValue} ${searchText}`;
    const personIds = [randomUUID(), randomUUID(), randomUUID()];

    const createdPeople = await makeGraphqlApiRequest(
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

    expect(createdPeople.body.errors).toBeUndefined();

    const viewId = await createOneViewOnObject({
      objectNameSingular: 'person',
      input: {
        name: `Filters and search text ${token}`,
        anyFieldFilterValue: searchText,
      },
    });

    try {
      const { data: viewFilterGroupData } = await createOneViewFilterGroup({
        expectToFail: false,
        gqlFields: 'id',
        input: {
          viewId,
          logicalOperator: ViewFilterGroupLogicalOperator.AND,
          positionInViewFilterGroup: 0,
        },
      });
      const { errors } = await createOneViewFilter({
        expectToFail: false,
        gqlFields: 'id',
        input: {
          viewId,
          viewFilterGroupId: viewFilterGroupData.createViewFilterGroup.id,
          fieldMetadataId: await findFieldMetadataIdByName({
            objectMetadataId: await findObjectMetadataIdByName('person'),
            fieldName: 'jobTitle',
          }),
          operand: ViewFilterOperand.CONTAINS,
          value: filterValue,
          positionInViewFilterGroup: 0,
        },
      });

      expect(errors).toBeUndefined();

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
      expect(
        response.body.data.peopleGroupBy.map(
          ({ groupByDimensionValues }: { groupByDimensionValues: string[] }) =>
            groupByDimensionValues[0],
        ),
      ).toEqual([keptJobTitle]);
    } finally {
      await destroyOneView({ viewId, expectToFail: false });
      await makeGraphqlApiRequest(
        destroyManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: 'id',
          filter: { id: { in: personIds } },
        }),
      );
    }
  });
});
