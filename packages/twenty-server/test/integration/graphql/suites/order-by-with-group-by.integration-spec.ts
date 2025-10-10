import { randomUUID } from 'crypto';

import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { groupByOperationFactory } from 'test/integration/graphql/utils/group-by-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

describe('group-by resolvers (integration)', () => {
  describe('date range', () => {
    const testCompanyId1 = randomUUID();
    const testCompanyId2 = randomUUID();
    const testCompanyId3 = randomUUID();
    const testCompanyId4 = randomUUID();
    const testCompanyId5 = randomUUID();
    const testCompanyId6 = randomUUID();
    const testCompanyId7 = randomUUID();

    beforeAll(async () => {
      // Seed three companies with different cities and createdAt days
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: COMPANY_GQL_FIELDS,
          data: {
            id: testCompanyId1,
            createdAt: '2025-03-03T09:30:00.000Z', // Monday
            address: { addressCity: 'Cuzco' },
            employees: 20,
            annualRecurringRevenue: { amountMicros: 100 },
          },
        }),
      );
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: COMPANY_GQL_FIELDS,
          data: {
            id: testCompanyId7,
            createdAt: '2025-03-03T09:30:00.000Z', // Monday
            address: { addressCity: 'Anvers' },
            employees: 19,
            annualRecurringRevenue: { amountMicros: 100 },
          },
        }),
      );

      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: COMPANY_GQL_FIELDS,
          data: {
            id: testCompanyId2,
            createdAt: '2025-03-03T09:30:00.000Z', // Monday
            address: { addressCity: 'Cuzco' },
            employees: 19,
            annualRecurringRevenue: { amountMicros: 105 },
          },
        }),
      );
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: COMPANY_GQL_FIELDS,
          data: {
            id: testCompanyId3,
            createdAt: '2025-03-03T09:30:00.000Z', // Monday
            address: { addressCity: 'Dallas' },
            employees: 2,
            annualRecurringRevenue: { amountMicros: 100 },
          },
        }),
      );
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: COMPANY_GQL_FIELDS,
          data: {
            id: testCompanyId4,
            createdAt: '2025-01-02T12:00:00.000Z', // Thursday
            address: { addressCity: 'Paris' },
            employees: 10,
            annualRecurringRevenue: { amountMicros: 100 },
          },
        }),
      );
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: COMPANY_GQL_FIELDS,
          data: {
            id: testCompanyId5,
            createdAt: '2025-01-08T08:00:00.000Z', // Wednesday
            address: { addressCity: 'Barcelona' },
            employees: 5,
            annualRecurringRevenue: { amountMicros: 100 },
          },
        }),
      );
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: COMPANY_GQL_FIELDS,
          data: {
            id: testCompanyId6,
            createdAt: '2025-01-08T08:00:00.000Z', // Wednesday
            address: { addressCity: 'Barcelona' },
            employees: 1,
            annualRecurringRevenue: { amountMicros: 100 },
          },
        }),
      );
    });

    afterAll(async () => {
      // cleanup created companies
      for (const id of [
        testCompanyId1,
        testCompanyId2,
        testCompanyId3,
        testCompanyId4,
        testCompanyId5,
        testCompanyId6,
        testCompanyId7,
      ]) {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'company',
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

    const groupByAdressCreateAtAndARR = (orderBy: object[]) => {
      return groupByOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        groupBy: [
          { address: { addressCity: true } },
          { createdAt: { granularity: 'DAY_OF_THE_WEEK' } },
          {
            annualRecurringRevenue: {
              amountMicros: true,
            },
          },
        ],
        orderBy,
        filter: filter2025,
        gqlFields: `
        avgEmployees
      `,
      });
    };

    it('should order results in the right order - createdAt, avgEmployees, addressCity', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAdressCreateAtAndARR([
          {
            createdAt: {
              granularity: 'DAY_OF_THE_WEEK',
              orderBy: 'AscNullsFirst',
            },
          },
          {
            aggregate: {
              avgEmployees: 'AscNullsFirst',
            },
          },
          {
            address: {
              addressCity: 'AscNullsFirst',
            },
          },
        ]),
      );

      const groups = response.body.data.companiesGroupBy;

      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBe(true);

      // Extract group info for easier assertions
      const groupInfos = groups.map((g: any) => ({
        city: g.groupByDimensionValues?.[0],
        dayOfWeek: g.groupByDimensionValues?.[1],
        annualRecurringRevenue: g.groupByDimensionValues?.[2],
        avgEmployees: g.avgEmployees,
        totalCount: g.totalCount,
      }));

      // Order by dayOfWeek then avgEmployees then city
      expect(groupInfos).toEqual([
        {
          city: 'Dallas',
          dayOfWeek: 'Monday',
          avgEmployees: 2,
          totalCount: 1,
          annualRecurringRevenue: '100',
        },
        {
          city: 'Anvers',
          dayOfWeek: 'Monday',
          avgEmployees: 19,
          totalCount: 1,
          annualRecurringRevenue: '100',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgEmployees: 19,
          totalCount: 1,
          annualRecurringRevenue: '105',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgEmployees: 20,
          totalCount: 1,
          annualRecurringRevenue: '100',
        },
        {
          city: 'Paris',
          dayOfWeek: 'Thursday',
          avgEmployees: 10,
          totalCount: 1,
          annualRecurringRevenue: '100',
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          avgEmployees: 3,
          totalCount: 2,
          annualRecurringRevenue: '100',
        },
      ]);
    });
    it('should order results in the right order - createdAt, addressCity, avgEmployees', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAdressCreateAtAndARR([
          {
            createdAt: {
              granularity: 'DAY_OF_THE_WEEK',
              orderBy: 'AscNullsFirst',
            },
          },
          {
            address: {
              addressCity: 'AscNullsFirst',
            },
          },
          {
            aggregate: {
              avgEmployees: 'AscNullsFirst',
            },
          },
        ]),
      );
      const groups = response.body.data.companiesGroupBy;

      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBe(true);

      const groupInfos = groups.map((g: any) => ({
        city: g.groupByDimensionValues?.[0],
        dayOfWeek: g.groupByDimensionValues?.[1],
        annualRecurringRevenue: g.groupByDimensionValues?.[2],
        avgEmployees: g.avgEmployees,
        totalCount: g.totalCount,
      }));

      expect(groupInfos).toEqual([
        {
          city: 'Anvers',
          dayOfWeek: 'Monday',
          avgEmployees: 19,
          totalCount: 1,
          annualRecurringRevenue: '100',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgEmployees: 19,
          totalCount: 1,
          annualRecurringRevenue: '105',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgEmployees: 20,
          totalCount: 1,
          annualRecurringRevenue: '100',
        },
        {
          city: 'Dallas',
          dayOfWeek: 'Monday',
          avgEmployees: 2,
          totalCount: 1,
          annualRecurringRevenue: '100',
        },
        {
          city: 'Paris',
          dayOfWeek: 'Thursday',
          avgEmployees: 10,
          totalCount: 1,
          annualRecurringRevenue: '100',
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          avgEmployees: 3,
          totalCount: 2,
          annualRecurringRevenue: '100',
        },
      ]);
    });
    it('should order results in the right order - addressCity, createdAt, avgEmployees', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAdressCreateAtAndARR([
          {
            address: {
              addressCity: 'AscNullsFirst',
            },
          },
          {
            createdAt: {
              granularity: 'DAY_OF_THE_WEEK',
              orderBy: 'AscNullsFirst',
            },
          },
          {
            aggregate: {
              avgEmployees: 'AscNullsFirst',
            },
          },
        ]),
      );
      const groups = response.body.data.companiesGroupBy;

      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBe(true);

      const groupInfos = groups.map((g: any) => ({
        city: g.groupByDimensionValues?.[0],
        dayOfWeek: g.groupByDimensionValues?.[1],
        annualRecurringRevenue: g.groupByDimensionValues?.[2],
        avgEmployees: g.avgEmployees,
        totalCount: g.totalCount,
      }));

      expect(groupInfos).toEqual([
        {
          city: 'Anvers',
          dayOfWeek: 'Monday',
          avgEmployees: 19,
          totalCount: 1,
          annualRecurringRevenue: '100',
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          avgEmployees: 3,
          totalCount: 2,
          annualRecurringRevenue: '100',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgEmployees: 19,
          totalCount: 1,
          annualRecurringRevenue: '105',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgEmployees: 20,
          totalCount: 1,
          annualRecurringRevenue: '100',
        },
        {
          city: 'Dallas',
          dayOfWeek: 'Monday',
          avgEmployees: 2,
          totalCount: 1,
          annualRecurringRevenue: '100',
        },
        {
          city: 'Paris',
          dayOfWeek: 'Thursday',
          avgEmployees: 10,
          totalCount: 1,
          annualRecurringRevenue: '100',
        },
      ]);
    });
    it('should order results in the right order - avgEmployees, createdAt, addressCity', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAdressCreateAtAndARR([
          {
            aggregate: {
              avgEmployees: 'AscNullsFirst',
            },
          },
          {
            createdAt: {
              granularity: 'DAY_OF_THE_WEEK',
              orderBy: 'AscNullsFirst',
            },
          },
          {
            address: {
              addressCity: 'AscNullsFirst',
            },
          },
        ]),
      );
      const groups = response.body.data.companiesGroupBy;

      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBe(true);

      const groupInfos = groups.map((g: any) => ({
        city: g.groupByDimensionValues?.[0],
        dayOfWeek: g.groupByDimensionValues?.[1],
        annualRecurringRevenue: g.groupByDimensionValues?.[2],
        avgEmployees: g.avgEmployees,
        totalCount: g.totalCount,
      }));

      expect(groupInfos).toEqual([
        {
          city: 'Dallas',
          dayOfWeek: 'Monday',
          avgEmployees: 2,
          totalCount: 1,
          annualRecurringRevenue: '100',
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          avgEmployees: 3,
          totalCount: 2,
          annualRecurringRevenue: '100',
        },
        {
          city: 'Paris',
          dayOfWeek: 'Thursday',
          avgEmployees: 10,
          totalCount: 1,
          annualRecurringRevenue: '100',
        },
        {
          city: 'Anvers',
          dayOfWeek: 'Monday',
          avgEmployees: 19,
          totalCount: 1,
          annualRecurringRevenue: '100',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgEmployees: 19,
          totalCount: 1,
          annualRecurringRevenue: '105',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgEmployees: 20,
          totalCount: 1,
          annualRecurringRevenue: '100',
        },
      ]);
    });
  });
});
