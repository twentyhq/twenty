import { randomUUID } from 'crypto';

import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { createViewFilterGroupOperationFactory } from 'test/integration/graphql/utils/create-view-filter-group-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { groupByOperationFactory } from 'test/integration/graphql/utils/group-by-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneCoreViewFilter } from 'test/integration/metadata/suites/view-filter/utils/create-one-core-view-filter.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  FieldMetadataType,
  RelationType,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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

  describe('group by relation fields', () => {
    const testPersonId = randomUUID();
    const testPerson2Id = randomUUID();
    const testPerson3Id = randomUUID();
    const testCompanyId = randomUUID();
    const testCompany2Id = randomUUID();

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

    beforeAll(async () => {
      // Create companies with different createdAt dates for grouping
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: COMPANY_GQL_FIELDS,
          data: {
            id: testCompanyId,
            name: 'Company A',
            createdAt: '2025-01-02T12:00:00.000Z', // Thursday
            address: {
              addressCity: 'City A',
            },
          },
        }),
      );

      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: COMPANY_GQL_FIELDS,
          data: {
            id: testCompany2Id,
            name: 'Company B',
            createdAt: '2025-01-08T08:00:00.000Z', // Wednesday
            address: {
              addressCity: 'City B',
            },
          },
        }),
      );

      // Create people linked to companies
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          data: {
            id: testPersonId,
            companyId: testCompanyId,
            createdAt: '2025-03-03T09:30:00.000Z',
          },
        }),
      );

      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          data: {
            id: testPerson2Id,
            companyId: testCompanyId,
            createdAt: '2025-03-03T09:30:00.000Z',
          },
        }),
      );

      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          data: {
            id: testPerson3Id,
            companyId: testCompany2Id,
            createdAt: '2025-03-03T09:30:00.000Z',
          },
        }),
      );
    });

    afterAll(async () => {
      // Cleanup people
      for (const id of [testPersonId, testPerson2Id, testPerson3Id]) {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            recordId: id,
          }),
        );
      }

      // Cleanup companies
      for (const id of [testCompanyId, testCompany2Id]) {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'company',
            gqlFields: 'id',
            recordId: id,
          }),
        );
      }
    });

    it('groups by one relation field - company createdAt with DAY_OF_THE_WEEK granularity', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          groupBy: [
            {
              company: {
                createdAt: {
                  granularity: 'DAY_OF_THE_WEEK',
                },
              },
            },
          ],
          filter: filter2025,
        }),
      );

      const groups = response.body.data.peopleGroupBy;

      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBe(true);

      const thursdayGroup = groups.find((g: any) =>
        g.groupByDimensionValues?.[0]?.startsWith?.('Thursday'),
      );
      const wednesdayGroup = groups.find((g: any) =>
        g.groupByDimensionValues?.[0]?.startsWith?.('Wednesday'),
      );

      expect(thursdayGroup).toBeDefined();
      expect(wednesdayGroup).toBeDefined();

      expect(thursdayGroup.totalCount).toBe(2);
      expect(wednesdayGroup.totalCount).toBe(1);
    });

    it('groups by two relation fields from the same joined table', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          groupBy: [
            {
              company: {
                createdAt: {
                  granularity: 'DAY_OF_THE_WEEK',
                },
              },
            },
            {
              company: {
                address: {
                  addressCity: true,
                },
              },
            },
          ],
          filter: filter2025,
        }),
      );

      const groups = response.body.data.peopleGroupBy;

      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBe(true);

      const thursdayCityAGroup = groups.find(
        (g: any) =>
          g.groupByDimensionValues?.[0]?.startsWith?.('Thursday') &&
          g.groupByDimensionValues?.[1] === 'City A',
      );
      const wednesdayCityBGroup = groups.find(
        (g: any) =>
          g.groupByDimensionValues?.[0]?.startsWith?.('Wednesday') &&
          g.groupByDimensionValues?.[1] === 'City B',
      );

      expect(thursdayCityAGroup).toBeDefined();
      expect(wednesdayCityBGroup).toBeDefined();

      expect(thursdayCityAGroup.totalCount).toBe(2);
      expect(wednesdayCityBGroup.totalCount).toBe(1);
    });
  });

  describe('group by relation fields from different tables', () => {
    const testPersonId = randomUUID();
    const testPerson2Id = randomUUID();
    const testPerson3Id = randomUUID();
    const testCompanyId = randomUUID();
    const testCompany2Id = randomUUID();
    const testlistingId = randomUUID();
    const testlisting2Id = randomUUID();
    let listingObjectMetadataId: string;
    let personlistingRelationFieldId: string;
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

    beforeAll(async () => {
      // Find person and company object metadata
      const { objects } = await findManyObjectMetadata({
        input: {
          filter: {},
          paging: {
            first: 100,
          },
        },
        gqlFields: 'id nameSingular',
        expectToFail: false,
      });

      const personObject = objects.find((o) => o.nameSingular === 'person');
      const companyObject = objects.find((o) => o.nameSingular === 'company');

      if (!personObject?.id || !companyObject?.id) {
        throw new Error('Person or Company object not found');
      }

      // Create listing object
      const { data: createListingObjectData } = await createOneObjectMetadata({
        input: {
          nameSingular: 'listing',
          namePlural: 'listings',
          labelSingular: 'Listing',
          labelPlural: 'Listings',
          icon: 'IconPaw',
        },
        expectToFail: false,
      });

      listingObjectMetadataId = createListingObjectData.createOneObject.id;

      // Create relation from person to listing
      const personlistingRelation = await createRelationBetweenObjects({
        objectMetadataId: personObject.id,
        targetObjectMetadataId: listingObjectMetadataId,
        relationType: RelationType.MANY_TO_ONE,
        type: FieldMetadataType.RELATION,
        name: 'assignedListing',
      });

      personlistingRelationFieldId = personlistingRelation.id;

      // Create companies
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: COMPANY_GQL_FIELDS,
          data: {
            id: testCompanyId,
            name: 'Company A',
          },
        }),
      );

      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: COMPANY_GQL_FIELDS,
          data: {
            id: testCompany2Id,
            name: 'Company B',
          },
        }),
      );

      // Create listings
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'listing',
          gqlFields: 'id name',
          data: {
            id: testlistingId,
            name: 'Flat in Paris',
          },
        }),
      );

      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'listing',
          gqlFields: 'id name',
          data: {
            id: testlisting2Id,
            name: 'House in Marseille',
          },
        }),
      );

      // Create people linked to companies and listings
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          data: {
            id: testPersonId,
            companyId: testCompanyId,
            assignedListingId: testlistingId,
            createdAt: '2025-03-03T09:30:00.000Z',
          },
        }),
      );

      const ao = await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          data: {
            id: testPerson2Id,
            companyId: testCompanyId,
            assignedListingId: testlisting2Id,
            createdAt: '2025-03-03T09:30:00.000Z',
          },
        }),
      );

      const b = await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          data: {
            id: testPerson3Id,
            companyId: testCompanyId,
            assignedListingId: testlisting2Id,
            createdAt: '2025-03-03T09:30:00.000Z',
          },
        }),
      );
    });

    afterAll(async () => {
      // Cleanup people
      for (const id of [testPersonId, testPerson2Id, testPerson3Id]) {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            recordId: id,
          }),
        );
      }

      // Cleanup listings
      for (const id of [testlistingId, testlisting2Id]) {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'listing',
            gqlFields: 'id',
            recordId: id,
          }),
        );
      }

      // Cleanup company
      for (const id of [testCompanyId, testCompany2Id]) {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'company',
            gqlFields: 'id',
            recordId: id,
          }),
        );
      }

      // Cleanup relation field
      if (isDefined(personlistingRelationFieldId)) {
        await updateOneFieldMetadata({
          input: {
            idToUpdate: personlistingRelationFieldId,
            updatePayload: {
              isActive: false,
            },
          },
          expectToFail: false,
        });

        await deleteOneFieldMetadata({
          input: { idToDelete: personlistingRelationFieldId },
          expectToFail: false,
        });
      }

      // Cleanup listing object
      if (isDefined(listingObjectMetadataId)) {
        await updateOneObjectMetadata({
          input: {
            idToUpdate: listingObjectMetadataId,
            updatePayload: {
              isActive: false,
            },
          },
          expectToFail: false,
        });

        await deleteOneObjectMetadata({
          input: { idToDelete: listingObjectMetadataId },
          expectToFail: false,
        });
      }
    });

    it('groups by two relation fields from different tables', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          groupBy: [
            {
              company: {
                name: true,
              },
            },
            {
              assignedListing: {
                name: true,
              },
            },
          ],
          filter: filter2025,
        }),
      );

      const groups = response.body.data.peopleGroupBy;

      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBe(true);

      const companyAFlatInParisGroup = groups.find(
        (g: any) =>
          g.groupByDimensionValues?.[0] === 'Company A' &&
          g.groupByDimensionValues?.[1] === 'Flat in Paris',
      );
      const companyAHouseInMarseilleGroup = groups.find(
        (g: any) =>
          g.groupByDimensionValues?.[0] === 'Company A' &&
          g.groupByDimensionValues?.[1] === 'House in Marseille',
      );

      expect(companyAFlatInParisGroup).toBeDefined();
      expect(companyAHouseInMarseilleGroup).toBeDefined();

      expect(companyAFlatInParisGroup.totalCount).toBe(1);
      expect(companyAHouseInMarseilleGroup.totalCount).toBe(2);
    });
  });
});
