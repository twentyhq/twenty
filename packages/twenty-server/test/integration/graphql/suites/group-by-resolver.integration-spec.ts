import { randomUUID } from 'crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { createViewFilterGroupOperationFactory } from 'test/integration/graphql/utils/create-view-filter-group-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { groupByOperationFactory } from 'test/integration/graphql/utils/group-by-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneCoreViewFilter } from 'test/integration/metadata/suites/view-filter/utils/create-one-core-view-filter.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { ViewFilterOperand } from 'twenty-shared/types';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';

describe('group-by resolver (integration)', () => {
  describe('standard case', () => {
    const testPersonId = randomUUID();
    const testPerson2Id = randomUUID();
    const testPerson3Id = randomUUID();

    afterEach(async () => {
      // cleanup created people
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          recordId: testPersonId,
        }),
      );
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          recordId: testPerson2Id,
        }),
      );
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
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

    it('computes aggregated metrics on date time field', async () => {
      const cityA = 'City A';
      const cityB = 'City B';

      const person1 = (
        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_GQL_FIELDS,
            data: { id: testPersonId, city: cityA },
          }),
        )
      ).body.data.createPerson;

      const person2 = (
        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_GQL_FIELDS,
            data: { id: testPerson2Id, city: cityB },
          }),
        )
      ).body.data.createPerson;

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
          gqlFields: 'minCreatedAt',
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
      expect(groupWithCityA.minCreatedAt).toEqual(person1.createdAt);

      const groupWithCityB = groups.find(
        (group: any) => group.groupByDimensionValues[0] === cityB,
      );

      expect(groupWithCityB.groupByDimensionValues).toEqual([cityB]);
      expect(groupWithCityB.minCreatedAt).toEqual(person2.createdAt);
    });
  });

  describe('date range', () => {
    const testPersonId = randomUUID();
    const testPerson2Id = randomUUID();
    const testPerson3Id = randomUUID();

    beforeAll(async () => {
      const idJan2 = testPersonId;
      const idJan8 = testPerson2Id;
      const idMar3 = testPerson3Id;

      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          data: {
            id: idJan2,
            createdAt: '2025-01-02T12:00:00.000Z', // thursday, january, Q1, 2025
          },
        }),
      );
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          data: { id: idJan8, createdAt: '2025-01-08T08:00:00.000Z' }, // wednesday, january, Q1, 2025
        }),
      );
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          data: { id: idMar3, createdAt: '2025-03-03T09:30:00.000Z' }, // monday, march, Q1, 2025
        }),
      );
    });

    afterAll(async () => {
      // cleanup created people
      for (const id of [testPersonId, testPerson2Id, testPerson3Id]) {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            recordId: id,
          }),
        );
      }
    });

    const filter2025 = {
      and: [
        {
          createdAt: {
            gte: '2025-01-01T00:00:00.000Z',
          },
        },
        {
          createdAt: {
            lte: '2025-03-03T23:59:59.999Z',
          },
        },
      ],
    };

    it('datetime field - groups by createdAt MONTH', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          groupBy: [{ createdAt: { granularity: 'MONTH' } }],
          filter: filter2025,
        }),
      );

      const groups = response.body.data.peopleGroupBy;

      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBe(true);

      // Expect two groups: January 2025 and March 2025
      const janGroup = groups.find((g: any) =>
        g.groupByDimensionValues?.[0]?.startsWith?.('2025-01-01'),
      );
      const marGroup = groups.find((g: any) =>
        g.groupByDimensionValues?.[0]?.startsWith?.('2025-03-01'),
      );

      expect(janGroup).toBeDefined();
      expect(marGroup).toBeDefined();

      expect(janGroup.totalCount).toBe(2);
      expect(marGroup.totalCount).toBe(1);
    });

    describe('cyclic date', () => {
      const filter2024And2025 = {
        and: [
          {
            createdAt: {
              gte: '2024-01-01T00:00:00.000Z',
            },
          },
          {
            createdAt: {
              lte: '2025-03-03T23:59:59.999Z',
            },
          },
        ],
      };

      const testPersonId2024 = randomUUID();

      beforeAll(async () => {
        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_GQL_FIELDS,
            data: {
              id: testPersonId2024,
              createdAt: '2024-04-11T12:00:00.000Z', // thursday, april, Q2, 2024
            },
          }),
        );
      });

      afterAll(async () => {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            recordId: testPersonId2024,
          }),
        );
      });
      it('datetime field - groups by createdAt DAY_OF_THE_WEEK', async () => {
        const response = await makeGraphqlAPIRequest(
          groupByOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            groupBy: [{ createdAt: { granularity: 'DAY_OF_THE_WEEK' } }],
            // adding a filter for test not to fail when we are in january again
            filter: filter2024And2025,
          }),
        );

        const groups = response.body.data.peopleGroupBy;

        expect(groups).toBeDefined();
        expect(Array.isArray(groups)).toBe(true);

        const thursdayGroup = groups.find((g: any) =>
          g.groupByDimensionValues?.[0]?.startsWith?.('Thursday'),
        );
        const mondayGroup = groups.find((g: any) =>
          g.groupByDimensionValues?.[0]?.startsWith?.('Monday'),
        );
        const wednesdayGroup = groups.find((g: any) =>
          g.groupByDimensionValues?.[0]?.startsWith?.('Wednesday'),
        );

        expect(thursdayGroup).toBeDefined();
        expect(mondayGroup).toBeDefined();
        expect(wednesdayGroup).toBeDefined();

        expect(thursdayGroup.totalCount).toBe(2);
        expect(mondayGroup.totalCount).toBe(1);
        expect(wednesdayGroup.totalCount).toBe(1);
      });

      it('datetime field - groups by createdAt MONTH_OF_THE_YEAR', async () => {
        const response = await makeGraphqlAPIRequest(
          groupByOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            groupBy: [{ createdAt: { granularity: 'MONTH_OF_THE_YEAR' } }],
            filter: filter2024And2025,
          }),
        );

        const groups = response.body.data.peopleGroupBy;

        expect(groups).toBeDefined();
        expect(Array.isArray(groups)).toBe(true);

        const janGroup = groups.find((g: any) =>
          g.groupByDimensionValues?.[0]?.startsWith?.('January'),
        );
        const marGroup = groups.find((g: any) =>
          g.groupByDimensionValues?.[0]?.startsWith?.('March'),
        );
        const aprGroup = groups.find((g: any) =>
          g.groupByDimensionValues?.[0]?.startsWith?.('April'),
        );

        expect(janGroup).toBeDefined();
        expect(marGroup).toBeDefined();
        expect(aprGroup).toBeDefined();

        expect(janGroup.totalCount).toBe(2);
        expect(marGroup.totalCount).toBe(1);
        expect(aprGroup.totalCount).toBe(1);
      });

      it('datetime field - groups by createdAt QUARTER_OF_THE_YEAR', async () => {
        const response = await makeGraphqlAPIRequest(
          groupByOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            groupBy: [{ createdAt: { granularity: 'QUARTER_OF_THE_YEAR' } }],
            filter: filter2024And2025,
          }),
        );

        const groups = response.body.data.peopleGroupBy;

        expect(groups).toBeDefined();
        expect(Array.isArray(groups)).toBe(true);

        const q1Group = groups.find((g: any) =>
          g.groupByDimensionValues?.[0]?.startsWith?.('Q1'),
        );
        const q2Group = groups.find((g: any) =>
          g.groupByDimensionValues?.[0]?.startsWith?.('Q2'),
        );

        expect(q1Group).toBeDefined();
        expect(q2Group).toBeDefined();

        expect(q1Group.totalCount).toBe(3);
        expect(q2Group.totalCount).toBe(1);
      });
    });
  });

  describe('with viewId defined', () => {
    const testPersonId = randomUUID();
    const testPerson2Id = randomUUID();
    const testPerson3Id = randomUUID();
    let viewId: string;
    let personObjectMetadataId: string;
    let personObject: ObjectMetadataDTO & {
      fieldsList?: FieldMetadataDTO[];
    };

    beforeAll(async () => {
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

      const person = objects.find((o) => o.nameSingular === 'person');

      if (!person || !person.id) {
        throw new Error('Person object not found');
      }

      personObject = person;

      personObjectMetadataId = personObject.id;
    });

    afterEach(async () => {
      // cleanup created people
      for (const id of [testPersonId, testPerson2Id, testPerson3Id]) {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            recordId: id,
          }),
        );
      }

      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'view',
          gqlFields: 'id',
          recordId: viewId,
        }),
      );
    });
    it('groups by city', async () => {
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
      const { data: createViewData } = await createOneCoreView({
        input: {
          name: 'People View City Keep',
          objectMetadataId: personObjectMetadataId,
          icon: 'Icon123',
        },
        expectToFail: false,
      });

      viewId = createViewData.createCoreView.id;

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

      jestExpectToBeDefined(cityFieldMetadataId);
      await createOneCoreViewFilter({
        input: {
          viewId,
          viewFilterGroupId,
          fieldMetadataId: cityFieldMetadataId,
          operand: ViewFilterOperand.CONTAINS,
          value: cityToKeep,
          positionInViewFilterGroup: 0,
        },
        expectToFail: false,
      });

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

    it('groups by city with any field filter', async () => {
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

      // create a view with any field filter
      const { data: createViewData } = await createOneCoreView({
        input: {
          name: 'People View City Keep',
          objectMetadataId: personObjectMetadataId,
          icon: 'Icon123',
          anyFieldFilterValue: cityA,
        },
        expectToFail: false,
      });

      viewId = createViewData.createCoreView.id;

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
          expect.objectContaining({ groupByDimensionValues: [cityA] }),
        ]),
      );
      // Ensure excluded city is not present
      expect(groups).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({ groupByDimensionValues: [cityB] }),
        ]),
      );
    });
  });
});
