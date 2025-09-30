import { randomUUID } from 'crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { createViewFilterGroupOperationFactory } from 'test/integration/graphql/utils/create-view-filter-group-operation-factory.util';
import { createViewFilterOperationFactory } from 'test/integration/graphql/utils/create-view-filter-operation-factory.util';
import { createViewOperationFactory } from 'test/integration/graphql/utils/create-view-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { groupByOperationFactory } from 'test/integration/graphql/utils/group-by-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';

import { ViewFilterOperand } from 'src/engine/core-modules/view/enums/view-filter-operand';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { ViewFilterGroupLogicalOperator } from 'src/modules/view/standard-objects/view-filter-group.workspace-entity';

describe('group-by resolvers (integration)', () => {
  describe('with viewId undefined', () => {
    const testPersonId = randomUUID();
    const testPerson2Id = randomUUID();
    const testPerson3Id = randomUUID();

    afterEach(async () => {
      // cleanup created people
      await makeGraphqlAPIRequest(
        deleteOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          recordId: testPersonId,
        }),
      );
      await makeGraphqlAPIRequest(
        deleteOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          recordId: testPerson2Id,
        }),
      );
      await makeGraphqlAPIRequest(
        deleteOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          recordId: testPerson3Id,
        }),
      );
    });
    it('groups by city', async () => {
      const cityA = 'City A';
      const cityB = 'City B';

      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          data: { id: testPersonId, city: cityA },
        }),
      );
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          data: { id: testPerson2Id, city: cityB },
        }),
      );
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          data: { id: testPerson3Id, city: cityB },
        }),
      );

      const response = await makeGraphqlAPIRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          groupBy: [{ city: true }],
        }),
      );

      const groups = response.body.data.peopleGroupBy;

      expect(groups).toBeDefined();
      expect(groups).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ groupByDimensionValues: [cityA] }),
          expect.objectContaining({ groupByDimensionValues: [cityB] }),
        ]),
      );

      const groupWithCityA = groups.find(
        (group: any) => group.groupByDimensionValues[0] === cityA,
      );

      expect(groupWithCityA.groupByDimensionValues).toEqual([cityA]);
      expect(groupWithCityA.totalCount).toEqual(1);

      const groupWithCityB = groups.find(
        (group: any) => group.groupByDimensionValues[0] === cityB,
      );

      expect(groupWithCityB.groupByDimensionValues).toEqual([cityB]);
      expect(groupWithCityB.totalCount).toEqual(2);
    });
  });

  describe('with viewId defined', () => {
    const testPersonId = randomUUID();
    const testPerson2Id = randomUUID();
    const testPerson3Id = randomUUID();

    afterEach(async () => {
      // cleanup created people
      await makeGraphqlAPIRequest(
        deleteOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          recordId: testPersonId,
        }),
      );
      await makeGraphqlAPIRequest(
        deleteOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          recordId: testPerson2Id,
        }),
      );
      await makeGraphqlAPIRequest(
        deleteOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          recordId: testPerson3Id,
        }),
      );
    });
    it('groups by city', async () => {
      const { objects } = await findManyObjectMetadata({
        input: {
          filter: {},
          paging: {
            first: 100,
          },
        },
        gqlFields: 'id nameSingular fieldsList { id name }',
        expectToFail: false,
      });

      const personObject = objects.find((o) => o.nameSingular === 'person');
      const personObjectMetadataId = personObject?.id;

      const cityFieldMetadata = personObject?.fieldsList?.find(
        (f: FieldMetadataDTO) => f.name === 'city',
      );
      const cityFieldMetadataId = cityFieldMetadata?.id;

      const cityToKeep = 'City To Keep';
      const cityToExclude = 'City To Exclude';

      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          data: { id: testPersonId, city: cityToKeep },
        }),
      );
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          data: { id: testPerson2Id, city: cityToExclude },
        }),
      );

      // create a view with a filter: city eq cityToKeep
      const createViewResponse = await makeGraphqlAPIRequest(
        createViewOperationFactory({
          data: {
            name: 'People View City Keep',
            objectMetadataId: personObjectMetadataId,
            icon: 'Icon123',
          },
        }),
      );

      const viewId = createViewResponse.body.data.createCoreView.id as string;

      // create a filter group and a filter for the view
      const viewFilterGroupResponse = await makeGraphqlAPIRequest(
        createViewFilterGroupOperationFactory({
          data: {
            viewId,
            logicalOperator: ViewFilterGroupLogicalOperator.AND,
            positionInViewFilterGroup: 0,
          },
        }),
      );

      const viewFilterGroupId = viewFilterGroupResponse.body.data
        .createCoreViewFilterGroup.id as string;

      await makeGraphqlAPIRequest(
        createViewFilterOperationFactory({
          data: {
            viewId,
            viewFilterGroupId,
            fieldMetadataId: cityFieldMetadataId,
            operand: ViewFilterOperand.CONTAINS,
            value: cityToKeep,
            positionInViewFilterGroup: 0,
          },
        }),
      );

      const response = await makeGraphqlAPIRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          groupBy: [{ city: true }],
          viewId,
        }),
      );

      const groups = response.body.data.peopleGroupBy;

      expect(groups).toBeDefined();
      expect(groups).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ groupByDimensionValues: [cityToKeep] }),
        ]),
      );
      // Ensure excluded city is not present
      expect(groups).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({ groupByDimensionValues: [cityToExclude] }),
        ]),
      );
    });
  });
});
