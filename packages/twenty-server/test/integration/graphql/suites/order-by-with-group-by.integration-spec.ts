import { randomUUID } from 'crypto';

import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { groupByOperationFactory } from 'test/integration/graphql/utils/group-by-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

describe('group-by resolvers - order by', () => {
  const testCompanyId1 = randomUUID();
  const testCompanyId2 = randomUUID();
  const testCompanyId3 = randomUUID();
  const testCompanyId4 = randomUUID();
  const testCompanyId5 = randomUUID();
  const testCompanyId6 = randomUUID();
  const testCompanyId7 = randomUUID();

  beforeAll(async () => {
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        data: {
          id: testCompanyId1,
          createdAt: '2025-03-03T09:30:00.000Z', // Monday
          address: { addressCity: 'Cuzco' },
          position: 20,
          annualRevenue: { amountMicros: 100 },
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
          position: 19,
          annualRevenue: { amountMicros: 100 },
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
          position: 19,
          annualRevenue: { amountMicros: 105 },
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
          position: 2,
          annualRevenue: { amountMicros: 100 },
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
          position: 10,
          annualRevenue: { amountMicros: 100 },
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
          position: 5,
          annualRevenue: { amountMicros: 100 },
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
          position: 1,
          annualRevenue: { amountMicros: 100 },
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

  const groupByAddressCreatedAtAndARR = (orderBy: object[]) => {
    return groupByOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      groupBy: [
        { address: { addressCity: true } },
        { createdAt: { granularity: 'DAY_OF_THE_WEEK' } },
        {
          annualRevenue: {
            amountMicros: true,
          },
        },
      ],
      orderBy,
      filter: filter2025,
      gqlFields: `
        avgPosition
      `,
    });
  };

  describe('valid cases', () => {
    it('should order results in the right order - createdAt, avgPosition, addressCity', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAddressCreatedAtAndARR([
          {
            createdAt: {
              granularity: 'DAY_OF_THE_WEEK',
              orderBy: 'AscNullsFirst',
            },
          },
          {
            aggregate: {
              avgPosition: 'AscNullsFirst',
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
        annualRevenue: g.groupByDimensionValues?.[2],
        avgPosition: g.avgPosition,
        totalCount: g.totalCount,
      }));

      // Order by dayOfWeek (chronological) then avgPosition then city
      expect(groupInfos).toEqual([
        {
          city: 'Dallas',
          dayOfWeek: 'Monday',
          avgPosition: 2,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Anvers',
          dayOfWeek: 'Monday',
          avgPosition: 19,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgPosition: 19,
          totalCount: 1,
          annualRevenue: '105',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgPosition: 20,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          avgPosition: 3,
          totalCount: 2,
          annualRevenue: '100',
        },
        {
          city: 'Paris',
          dayOfWeek: 'Thursday',
          avgPosition: 10,
          totalCount: 1,
          annualRevenue: '100',
        },
      ]);
    });
    it('should order results in the right order - createdAt, addressCity, avgPosition', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAddressCreatedAtAndARR([
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
              avgPosition: 'AscNullsFirst',
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
        annualRevenue: g.groupByDimensionValues?.[2],
        avgPosition: g.avgPosition,
        totalCount: g.totalCount,
      }));

      // Order by dayOfWeek (chronological) then addressCity then avgPosition
      expect(groupInfos).toEqual([
        {
          city: 'Anvers',
          dayOfWeek: 'Monday',
          avgPosition: 19,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgPosition: 19,
          totalCount: 1,
          annualRevenue: '105',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgPosition: 20,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Dallas',
          dayOfWeek: 'Monday',
          avgPosition: 2,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          avgPosition: 3,
          totalCount: 2,
          annualRevenue: '100',
        },
        {
          city: 'Paris',
          dayOfWeek: 'Thursday',
          avgPosition: 10,
          totalCount: 1,
          annualRevenue: '100',
        },
      ]);
    });
    it('should order results in the right order - addressCity, createdAt, avgPosition', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAddressCreatedAtAndARR([
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
              avgPosition: 'AscNullsFirst',
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
        annualRevenue: g.groupByDimensionValues?.[2],
        avgPosition: g.avgPosition,
        totalCount: g.totalCount,
      }));

      expect(groupInfos).toEqual([
        {
          city: 'Anvers',
          dayOfWeek: 'Monday',
          avgPosition: 19,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          avgPosition: 3,
          totalCount: 2,
          annualRevenue: '100',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgPosition: 19,
          totalCount: 1,
          annualRevenue: '105',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgPosition: 20,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Dallas',
          dayOfWeek: 'Monday',
          avgPosition: 2,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Paris',
          dayOfWeek: 'Thursday',
          avgPosition: 10,
          totalCount: 1,
          annualRevenue: '100',
        },
      ]);
    });
    it('should order results in the right order - avgPosition, createdAt, addressCity', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAddressCreatedAtAndARR([
          {
            aggregate: {
              avgPosition: 'AscNullsFirst',
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
        annualRevenue: g.groupByDimensionValues?.[2],
        avgPosition: g.avgPosition,
        totalCount: g.totalCount,
      }));

      expect(groupInfos).toEqual([
        {
          city: 'Dallas',
          dayOfWeek: 'Monday',
          avgPosition: 2,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          avgPosition: 3,
          totalCount: 2,
          annualRevenue: '100',
        },
        {
          city: 'Paris',
          dayOfWeek: 'Thursday',
          avgPosition: 10,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Anvers',
          dayOfWeek: 'Monday',
          avgPosition: 19,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgPosition: 19,
          totalCount: 1,
          annualRevenue: '105',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgPosition: 20,
          totalCount: 1,
          annualRevenue: '100',
        },
      ]);
    });
  });

  describe('chronological ordering for date granularities', () => {
    it('should order DAY_OF_THE_WEEK chronologically (Monday=1 to Sunday=7), not alphabetically', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'company',
          objectMetadataPluralName: 'companies',
          groupBy: [{ createdAt: { granularity: 'DAY_OF_THE_WEEK' } }],
          orderBy: [
            {
              createdAt: {
                granularity: 'DAY_OF_THE_WEEK',
                orderBy: 'AscNullsFirst',
              },
            },
          ],
          filter: filter2025,
          gqlFields: `
            totalCount
          `,
        }),
      );

      const groups = response.body.data.companiesGroupBy;

      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBe(true);

      const dayOrder = groups.map((g: any) => g.groupByDimensionValues?.[0]);

      // Monday (1), Wednesday (3), Thursday (4) - chronological order
      expect(dayOrder).toEqual(['Monday', 'Wednesday', 'Thursday']);
    });

    it('should order DAY_OF_THE_WEEK in descending chronological order', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'company',
          objectMetadataPluralName: 'companies',
          groupBy: [{ createdAt: { granularity: 'DAY_OF_THE_WEEK' } }],
          orderBy: [
            {
              createdAt: {
                granularity: 'DAY_OF_THE_WEEK',
                orderBy: 'DescNullsLast',
              },
            },
          ],
          filter: filter2025,
          gqlFields: `
            totalCount
          `,
        }),
      );

      const groups = response.body.data.companiesGroupBy;

      expect(groups).toBeDefined();

      const dayOrder = groups.map((g: any) => g.groupByDimensionValues?.[0]);

      // Thursday (4), Wednesday (3), Monday (1) - reverse chronological order
      expect(dayOrder).toEqual(['Thursday', 'Wednesday', 'Monday']);
    });

    it('should order MONTH_OF_THE_YEAR chronologically (January=1 to December=12), not alphabetically', async () => {
      // Test data has January (companies 4,5,6) and March (companies 1,2,3,7)
      // Chronological order: January (1), March (3)
      // Alphabetical would be: January, March (same in this case, but tests the mechanism)
      const response = await makeGraphqlAPIRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'company',
          objectMetadataPluralName: 'companies',
          groupBy: [{ createdAt: { granularity: 'MONTH_OF_THE_YEAR' } }],
          orderBy: [
            {
              createdAt: {
                granularity: 'MONTH_OF_THE_YEAR',
                orderBy: 'AscNullsFirst',
              },
            },
          ],
          filter: filter2025,
          gqlFields: `
            totalCount
          `,
        }),
      );

      const groups = response.body.data.companiesGroupBy;

      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBe(true);

      const monthOrder = groups.map((g: any) => g.groupByDimensionValues?.[0]);

      // January (1), March (3) - chronological order
      expect(monthOrder).toEqual(['January', 'March']);
    });

    it('should order MONTH_OF_THE_YEAR in descending chronological order', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'company',
          objectMetadataPluralName: 'companies',
          groupBy: [{ createdAt: { granularity: 'MONTH_OF_THE_YEAR' } }],
          orderBy: [
            {
              createdAt: {
                granularity: 'MONTH_OF_THE_YEAR',
                orderBy: 'DescNullsLast',
              },
            },
          ],
          filter: filter2025,
          gqlFields: `
            totalCount
          `,
        }),
      );

      const groups = response.body.data.companiesGroupBy;

      expect(groups).toBeDefined();

      const monthOrder = groups.map((g: any) => g.groupByDimensionValues?.[0]);

      // March (3), January (1) - reverse chronological order
      expect(monthOrder).toEqual(['March', 'January']);
    });
  });

  describe('invalid cases', () => {
    it('should fail if attempt to order by a field that is not part of the groupBy', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAddressCreatedAtAndARR([{ position: 'AscNullsFirst' }]),
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].message).toBe(
        'Cannot order by a field that is not an aggregate nor in groupBy criteria: position.',
      );
    });

    it('should fail if attempt to order by a date granularity that is not the same as in the groupBy', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAddressCreatedAtAndARR([
          { createdAt: { granularity: 'MONTH', orderBy: 'AscNullsFirst' } },
        ]),
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].message).toBe(
        'Cannot order by a date granularity that is not in groupBy criteria: MONTH',
      );
    });

    it('should fail if attempt to order by a date without indicating the granularity', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAddressCreatedAtAndARR([
          { createdAt: { orderBy: 'AscNullsFirst' } },
        ]),
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].message).toContain(
        'Cannot order by a field that is not in groupBy or that is not an aggregate field',
      );
    });

    it('should fail if attempt to indicate more than one orderBy field at the time (aggregate)', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAddressCreatedAtAndARR([
          {
            aggregate: {
              avgPosition: 'AscNullsFirst',
              avgAnnualRevenueAmountMicros: 'AscNullsFirst',
            },
          },
        ]),
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].message).toBe(
        'Please provide aggregate criteria one by one in orderBy array',
      );
    });

    it('should fail if attempt to indicate more than one orderBy field at the time', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAddressCreatedAtAndARR([
          {
            position: 'AscNullsFirst',
            name: 'AscNullsFirst',
          },
        ]),
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].message).toBe(
        'Please provide orderBy field criteria one by one in orderBy array',
      );
    });
  });
});
