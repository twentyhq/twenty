import { randomUUID } from 'crypto';

import { gql } from 'apollo-server-core';
import { default as request } from 'supertest';
import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { createViewFilterGroupOperationFactory } from 'test/integration/graphql/utils/create-view-filter-group-operation-factory.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { groupByOperationFactory } from 'test/integration/graphql/utils/group-by-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';
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
  OrderByDirection,
  RelationType,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

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
          orderBy: [{ city: OrderByDirection.AscNullsFirst }], // needed for City groups to be in 300 first groups
          limit: 300,
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

    it('limits the number of groups when limit argument is provided', async () => {
      const cityA = 'City A';
      const cityB = 'City B';
      const cityC = 'City C';

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
          data: { id: testPerson3Id, city: cityC },
        }),
      );

      const response = await makeGraphqlAPIRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          groupBy: [{ city: true }],
          limit: 2,
        }),
      );

      const groups = response.body.data.peopleGroupBy;

      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBe(true);
      expect(groups).toHaveLength(2);
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
          orderBy: [{ city: OrderByDirection.AscNullsFirst }], // needed for City groups to be in 300 first groups
          gqlFields: 'minCreatedAt',
          limit: 300,
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

    const idJan2 = testPersonId;
    const idJan8 = testPerson2Id;
    const idMar3 = testPerson3Id;

    beforeAll(async () => {
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
            lt: '2025-03-04T00:00:00.000Z',
          },
        },
      ],
    };

    it('datetime field - groups by createdAt MONTH', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          groupBy: [
            { createdAt: { granularity: 'MONTH', timeZone: 'Europe/Paris' } },
          ],
          filter: filter2025,
        }),
      );

      const groups = response.body.data.peopleGroupBy;

      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBe(true);
      expect(groups.length).toBe(2);

      const groupWith2Records = groups.find((g: any) => g.totalCount === 2);
      const groupWith1Record = groups.find((g: any) => g.totalCount === 1);

      expect(groupWith2Records).toBeDefined();
      expect(groupWith1Record).toBeDefined();

      expect(groupWith2Records.totalCount).toBe(2);
      expect(groupWith1Record.totalCount).toBe(1);
    });

    describe('group by week', () => {
      const idMarch1st = randomUUID();
      const idMarch2nd = randomUUID();
      const idMarch3rd = randomUUID();

      beforeAll(async () => {
        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_GQL_FIELDS,
            data: { id: idMarch3rd, createdAt: '2025-03-03T09:30:00.000Z' }, // monday, march, Q1, 2025
          }),
        );
        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_GQL_FIELDS,
            data: { id: idMarch2nd, createdAt: '2025-03-02T09:30:00.000Z' }, // sunday, march, Q1, 2025
          }),
        );
        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_GQL_FIELDS,
            data: { id: idMarch1st, createdAt: '2025-03-01T09:30:00.000Z' }, // saturday, march, Q1, 2025
          }),
        );
      });

      afterAll(async () => {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            recordId: idMarch1st,
          }),
        );
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            recordId: idMarch2nd,
          }),
        );
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            recordId: idMarch3rd,
          }),
        );
      });

      it('datetime field - groups by createdAt WEEK with default (MONDAY)', async () => {
        const response = await makeGraphqlAPIRequest(
          groupByOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            groupBy: [
              { createdAt: { granularity: 'WEEK', timeZone: 'Europe/Paris' } },
            ],
            gqlFields: `
              edges {
                node {
                  id
                }
              }
            `,
            filter: filter2025,
            limit: 10,
          }),
        );

        const groups = response.body.data.peopleGroupBy;

        expect(groups).toBeDefined();
        expect(groups.length).toBe(4);

        // Group starting week of monday dec 30th, 2024
        const mondayDec30thGroup = groups.find((group: any) =>
          group.groupByDimensionValues[0].startsWith('2024-12-30'),
        );

        expect(mondayDec30thGroup).toBeDefined();
        expect(mondayDec30thGroup.edges[0].node.id).toBe(idJan2);
        expect(mondayDec30thGroup.totalCount).toBe(1);

        // Group starting week of monday jan 6th, 2025
        const mondayJan6thGroup = groups.find((group: any) =>
          group.groupByDimensionValues[0].startsWith('2025-01-06'),
        );

        expect(mondayJan6thGroup).toBeDefined();
        expect(mondayJan6thGroup.edges[0].node.id).toBe(idJan8);
        expect(mondayJan6thGroup.totalCount).toBe(1);

        // Group starting week of monday feb 24th, 2025
        const mondayFeb24thGroup = groups.find((group: any) =>
          group.groupByDimensionValues[0].startsWith('2025-02-24'),
        );

        expect(mondayFeb24thGroup).toBeDefined();
        expect(mondayFeb24thGroup.edges.length).toBe(2);
        expect(
          mondayFeb24thGroup.edges.find(
            (edge: any) => edge.node.id === idMarch2nd,
          ),
        ).toBeDefined;
        expect(
          mondayFeb24thGroup.edges.find(
            (edge: any) => edge.node.id === idMarch1st,
          ),
        ).toBeDefined;

        // Group starting week of monday march 3rd, 2025
        const mondayMarch3rdGroup = groups.find((group: any) =>
          group.groupByDimensionValues[0].startsWith('2025-03-03'),
        );

        expect(mondayMarch3rdGroup).toBeDefined();
        expect(mondayMarch3rdGroup.edges.length).toBe(2);
        expect(
          mondayMarch3rdGroup.edges.find(
            (edge: any) => edge.node.id === idMarch3rd,
          ),
        ).toBeDefined;
        expect(
          mondayMarch3rdGroup.edges.find(
            (edge: any) => edge.node.id === idMar3,
          ),
        ).toBeDefined;
      });

      it('datetime field - groups by createdAt WEEK with weekStartDay SUNDAY', async () => {
        const response = await makeGraphqlAPIRequest(
          groupByOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            groupBy: [
              {
                createdAt: {
                  granularity: 'WEEK',
                  weekStartDay: 'SUNDAY',
                  timeZone: 'Europe/Paris',
                },
              },
            ],
            gqlFields: `
              edges {
                node {
                  id
                }
              }
            `,
            filter: filter2025,
            limit: 10,
          }),
        );

        const groups = response.body.data.peopleGroupBy;

        expect(groups).toBeDefined();
        expect(groups.length).toBe(4);

        // Group starting week of sunday dec 29th, 2024
        const sundayDec29thGroup = groups.find((group: any) =>
          group.groupByDimensionValues[0].startsWith('2024-12-29'),
        );

        expect(sundayDec29thGroup).toBeDefined();
        expect(sundayDec29thGroup.totalCount).toBe(1);
        expect(
          sundayDec29thGroup.edges.find((edge: any) => edge.node.id === idJan2),
        ).toBeDefined();

        // Group starting week of sunday jan 5th, 2025
        const sundayJan5thGroup = groups.find((group: any) =>
          group.groupByDimensionValues[0].startsWith('2025-01-05'),
        );

        expect(sundayJan5thGroup).toBeDefined();
        expect(sundayJan5thGroup.totalCount).toBe(1);
        expect(
          sundayJan5thGroup.edges.find((edge: any) => edge.node.id === idJan8),
        ).toBeDefined();

        // Group starting week of sunday feb 23rd, 2025
        const sundayFeb23rdGroup = groups.find((group: any) =>
          group.groupByDimensionValues[0].startsWith('2025-02-23'),
        );

        expect(sundayFeb23rdGroup).toBeDefined();
        expect(sundayFeb23rdGroup.totalCount).toBe(1);
        expect(
          sundayFeb23rdGroup.edges.find(
            (edge: any) => edge.node.id === idMarch1st,
          ),
        ).toBeDefined();

        // Group starting week of sunday march 2nd, 2025
        const sundayMarch2ndGroup = groups.find((group: any) =>
          group.groupByDimensionValues[0].startsWith('2025-03-02'),
        );

        expect(sundayMarch2ndGroup).toBeDefined();
        expect(sundayMarch2ndGroup.totalCount).toBe(3);
        expect(
          sundayMarch2ndGroup.edges.find(
            (edge: any) => edge.node.id === idMarch2nd,
          ),
        ).toBeDefined();
        expect(
          sundayMarch2ndGroup.edges.find(
            (edge: any) => edge.node.id === idMarch3rd,
          ),
        ).toBeDefined();
        expect(
          sundayMarch2ndGroup.edges.find(
            (edge: any) => edge.node.id === idMar3,
          ),
        ).toBeDefined();
      });

      it('datetime field - groups by createdAt WEEK with weekStartDay SATURDAY', async () => {
        const response = await makeGraphqlAPIRequest(
          groupByOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            groupBy: [
              {
                createdAt: {
                  granularity: 'WEEK',
                  weekStartDay: 'SATURDAY',
                  timeZone: 'Europe/Paris',
                },
              },
            ],
            gqlFields: `
              edges {
                node {
                  id
                }
              }
            `,
            filter: filter2025,
            limit: 10,
          }),
        );

        const groups = response.body.data.peopleGroupBy;

        expect(groups).toBeDefined();
        expect(groups.length).toBe(3);

        // Group starting week of saturday dec 28th, 2024
        const saturdayDec28thGroup = groups.find((group: any) =>
          group.groupByDimensionValues[0].startsWith('2024-12-28'),
        );

        expect(saturdayDec28thGroup).toBeDefined();
        expect(saturdayDec28thGroup.totalCount).toBe(1);
        expect(
          saturdayDec28thGroup.edges.find(
            (edge: any) => edge.node.id === idJan2,
          ),
        ).toBeDefined();

        // Group starting week of saturday jan 4th, 2025
        const saturdayJan4thGroup = groups.find((group: any) =>
          group.groupByDimensionValues[0].startsWith('2025-01-04'),
        );

        expect(saturdayJan4thGroup).toBeDefined();
        expect(saturdayJan4thGroup.totalCount).toBe(1);
        expect(
          saturdayJan4thGroup.edges.find(
            (edge: any) => edge.node.id === idJan8,
          ),
        ).toBeDefined();

        // Group starting week of saturday march 1st, 2025
        const saturdayMarch1stGroup = groups.find((group: any) =>
          group.groupByDimensionValues[0].startsWith('2025-03-01'),
        );

        expect(saturdayMarch1stGroup).toBeDefined();
        expect(saturdayMarch1stGroup.totalCount).toBe(4);
        expect(
          saturdayMarch1stGroup.edges.find(
            (edge: any) => edge.node.id === idMarch1st,
          ),
        ).toBeDefined();
        expect(
          saturdayMarch1stGroup.edges.find(
            (edge: any) => edge.node.id === idMarch2nd,
          ),
        ).toBeDefined();
        expect(
          saturdayMarch1stGroup.edges.find(
            (edge: any) => edge.node.id === idMarch3rd,
          ),
        ).toBeDefined();
        expect(
          saturdayMarch1stGroup.edges.find(
            (edge: any) => edge.node.id === idMar3,
          ),
        ).toBeDefined();
      });
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
              lt: '2025-03-04T00:00:00.000Z',
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
          orderBy: [{ city: OrderByDirection.AscNullsFirst }], // needed for City groups to be in 300 first groups
          limit: 300,
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

  describe('relation fields', () => {
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

      it('groups by one relation field - company createdAt with WEEK granularity and weekStartDay SUNDAY', async () => {
        const response = await makeGraphqlAPIRequest(
          groupByOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            groupBy: [
              {
                company: {
                  createdAt: {
                    granularity: 'WEEK',
                    weekStartDay: 'SUNDAY',
                  },
                },
              },
            ],
            filter: filter2025,
            limit: 10,
          }),
        );

        const groups = response.body.data.peopleGroupBy;

        expect(groups).toBeDefined();
        expect(Array.isArray(groups)).toBe(true);

        // Verify that all records are grouped
        const totalCount = groups.reduce(
          (sum: number, group: any) => sum + group.totalCount,
          0,
        );

        expect(totalCount).toBe(3);
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
        const { data: createListingObjectData } = await createOneObjectMetadata(
          {
            input: {
              nameSingular: 'listing',
              namePlural: 'listings',
              labelSingular: 'Listing',
              labelPlural: 'Listings',
              icon: 'IconPaw',
            },
            expectToFail: false,
          },
        );

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

        await makeGraphqlAPIRequest(
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

        await makeGraphqlAPIRequest(
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

    describe('group by morph relation fields', () => {
      const testPetId = randomUUID();
      const testPet2Id = randomUUID();
      const testPet3Id = randomUUID();
      const testRocketId = randomUUID();
      const testRocket2Id = randomUUID();

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
        // Create rockets with different names
        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'rocket',
            gqlFields: 'id name',
            data: {
              id: testRocketId,
              name: 'Rocket A',
            },
          }),
        );

        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'rocket',
            gqlFields: 'id name',
            data: {
              id: testRocket2Id,
              name: 'Rocket B',
            },
          }),
        );

        // Create pets linked to rockets via morph relation
        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'pet',
            gqlFields: 'id name ownerRocket { id name }',
            data: {
              id: testPetId,
              name: 'Pet 1',
              ownerRocketId: testRocketId,
              createdAt: '2025-03-03T09:30:00.000Z',
            },
          }),
        );

        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'pet',
            gqlFields: 'id name ownerRocket { id name }',
            data: {
              id: testPet2Id,
              name: 'Pet 2',
              ownerRocketId: testRocketId,
              createdAt: '2025-03-03T09:30:00.000Z',
            },
          }),
        );

        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'pet',
            gqlFields: 'id name ownerRocket { id name }',
            data: {
              id: testPet3Id,
              name: 'Pet 3',
              ownerRocketId: testRocket2Id,
              createdAt: '2025-03-03T09:30:00.000Z',
            },
          }),
        );
      });

      afterAll(async () => {
        // Cleanup pets
        for (const id of [testPetId, testPet2Id, testPet3Id]) {
          await makeGraphqlAPIRequest(
            destroyOneOperationFactory({
              objectMetadataSingularName: 'pet',
              gqlFields: 'id',
              recordId: id,
            }),
          );
        }

        // Cleanup rockets
        for (const id of [testRocketId, testRocket2Id]) {
          await makeGraphqlAPIRequest(
            destroyOneOperationFactory({
              objectMetadataSingularName: 'rocket',
              gqlFields: 'id',
              recordId: id,
            }),
          );
        }
      });

      it('groups by morph relation field - ownerRocket name', async () => {
        const response = await makeGraphqlAPIRequest(
          groupByOperationFactory({
            objectMetadataSingularName: 'pet',
            objectMetadataPluralName: 'pets',
            groupBy: [
              {
                ownerRocket: {
                  name: true,
                },
              },
            ],
            filter: filter2025,
          }),
        );

        const groups = response.body.data.petsGroupBy;

        expect(groups).toBeDefined();
        expect(Array.isArray(groups)).toBe(true);

        const rocketAGroup = groups.find(
          (g: any) => g.groupByDimensionValues?.[0] === 'Rocket A',
        );
        const rocketBGroup = groups.find(
          (g: any) => g.groupByDimensionValues?.[0] === 'Rocket B',
        );

        expect(rocketAGroup).toBeDefined();
        expect(rocketBGroup).toBeDefined();

        expect(rocketAGroup.totalCount).toBe(2);
        expect(rocketBGroup.totalCount).toBe(1);
      });
    });

    describe('should throw if group by a relation field user does not have reading rights on', () => {
      const testPetId = randomUUID();
      const testRocketId = randomUUID();
      let customRoleId: string;
      let petObjectId: string;
      let rocketObjectId: string;
      let originalMemberRoleId: string;

      beforeAll(async () => {
        // Get the original Member role ID for restoration later
        const getRolesQuery = {
          query: `
            query GetRoles {
              getRoles {
                id
                label
              }
            }
          `,
        };

        const rolesResponse = await client
          .post('/graphql')
          .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
          .send(getRolesQuery);

        originalMemberRoleId = rolesResponse.body.data.getRoles.find(
          (role: any) => role.label === 'Member',
        ).id;

        // Get object metadata IDs for pet and rocket
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

        const petObject = objects.find((o) => o.nameSingular === 'pet');
        const rocketObject = objects.find((o) => o.nameSingular === 'rocket');

        if (!petObject?.id || !rocketObject?.id) {
          throw new Error('Pet or Rocket object not found');
        }

        petObjectId = petObject.id;
        rocketObjectId = rocketObject.id;

        // Create a custom role with pet read permission but no rocket read permission
        const createRoleOperation = {
          query: gql`
            mutation CreateOneRole {
              createOneRole(
                createRoleInput: {
                  label: "PetOnlyRole"
                  description: "Test role with pet read permission but no rocket read permission"
                  canUpdateAllSettings: false
                  canReadAllObjectRecords: false
                  canUpdateAllObjectRecords: false
                  canSoftDeleteAllObjectRecords: false
                  canDestroyAllObjectRecords: false
                }
              ) {
                id
                label
              }
            }
          `,
        };

        const createRoleResponse =
          await makeGraphqlAPIRequest(createRoleOperation);

        customRoleId = createRoleResponse.body.data.createOneRole.id;

        // Set object permissions: allow reading pets but not rockets
        const upsertObjectPermissionsOperation = {
          query: gql`
            mutation UpsertObjectPermissions(
              $roleId: UUID!
              $objectPermissions: [ObjectPermissionInput!]!
            ) {
              upsertObjectPermissions(
                upsertObjectPermissionsInput: {
                  roleId: $roleId
                  objectPermissions: $objectPermissions
                }
              ) {
                objectMetadataId
                canReadObjectRecords
              }
            }
          `,
          variables: {
            roleId: customRoleId,
            objectPermissions: [
              {
                objectMetadataId: petObjectId,
                canReadObjectRecords: true,
                canUpdateObjectRecords: false,
                canSoftDeleteObjectRecords: false,
                canDestroyObjectRecords: false,
              },
              {
                objectMetadataId: rocketObjectId,
                canReadObjectRecords: false,
                canUpdateObjectRecords: false,
                canSoftDeleteObjectRecords: false,
                canDestroyObjectRecords: false,
              },
            ],
          },
        };

        await makeGraphqlAPIRequest(upsertObjectPermissionsOperation);

        // Assign the custom role to a workspace member
        await updateWorkspaceMemberRole({
          client,
          roleId: customRoleId,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        });

        // Create a rocket
        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'rocket',
            gqlFields: 'id name',
            data: {
              id: testRocketId,
              name: 'Test Rocket',
            },
          }),
        );

        // Create a pet linked to the rocket
        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'pet',
            gqlFields: 'id name ownerRocket { id name }',
            data: {
              id: testPetId,
              name: 'Test Pet',
              ownerRocketId: testRocketId,
              createdAt: '2025-03-03T09:30:00.000Z',
            },
          }),
        );
      });

      afterAll(async () => {
        // Cleanup pet
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'pet',
            gqlFields: 'id',
            recordId: testPetId,
          }),
        );

        // Cleanup rocket
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'rocket',
            gqlFields: 'id',
            recordId: testRocketId,
          }),
        );

        // // Restore original role
        const restoreMemberRoleQuery = {
          query: `
            mutation UpdateWorkspaceMemberRole {
              updateWorkspaceMemberRole(
                workspaceMemberId: "${WORKSPACE_MEMBER_DATA_SEED_IDS.JONY}"
                roleId: "${originalMemberRoleId}"
              ) {
                id
              }
            }
          `,
        };

        await client
          .post('/graphql')
          .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
          .send(restoreMemberRoleQuery);

        // // Delete custom role
        if (isDefined(customRoleId)) {
          await deleteRole(client, customRoleId);
        }
      });

      it('should throw a permission error when grouping by ownerRocket field without read permission', async () => {
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

        const response = await makeGraphqlAPIRequestWithMemberRole(
          groupByOperationFactory({
            objectMetadataSingularName: 'pet',
            objectMetadataPluralName: 'pets',
            groupBy: [
              {
                ownerRocket: {
                  name: true,
                },
              },
            ],
            filter: filter2025,
          }),
        );

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(response.body.errors[0].extensions.code).toBe(
          ErrorCode.FORBIDDEN,
        );
      });
    });
  });
});
