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
          employees: 20,
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
          employees: 19,
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
          employees: 19,
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
          employees: 2,
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
          employees: 10,
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
          employees: 5,
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
          employees: 1,
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
        avgEmployees
      `,
    });
  };

  describe('valid cases', () => {
    it('should order results in the right order - createdAt, avgEmployees, addressCity', async () => {
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
        annualRevenue: g.groupByDimensionValues?.[2],
        avgEmployees: g.avgEmployees,
        totalCount: g.totalCount,
      }));

      // Order by dayOfWeek (chronological) then avgEmployees then city
      expect(groupInfos).toEqual([
        {
          city: 'Dallas',
          dayOfWeek: 'Monday',
          avgEmployees: 2,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Anvers',
          dayOfWeek: 'Monday',
          avgEmployees: 19,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgEmployees: 19,
          totalCount: 1,
          annualRevenue: '105',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgEmployees: 20,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          avgEmployees: 3,
          totalCount: 2,
          annualRevenue: '100',
        },
        {
          city: 'Paris',
          dayOfWeek: 'Thursday',
          avgEmployees: 10,
          totalCount: 1,
          annualRevenue: '100',
        },
      ]);
    });
    it('should order results in the right order - createdAt, addressCity, avgEmployees', async () => {
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
        annualRevenue: g.groupByDimensionValues?.[2],
        avgEmployees: g.avgEmployees,
        totalCount: g.totalCount,
      }));

      // Order by dayOfWeek (chronological) then addressCity then avgEmployees
      expect(groupInfos).toEqual([
        {
          city: 'Anvers',
          dayOfWeek: 'Monday',
          avgEmployees: 19,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgEmployees: 19,
          totalCount: 1,
          annualRevenue: '105',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgEmployees: 20,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Dallas',
          dayOfWeek: 'Monday',
          avgEmployees: 2,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          avgEmployees: 3,
          totalCount: 2,
          annualRevenue: '100',
        },
        {
          city: 'Paris',
          dayOfWeek: 'Thursday',
          avgEmployees: 10,
          totalCount: 1,
          annualRevenue: '100',
        },
      ]);
    });
    it('should order results in the right order - addressCity, createdAt, avgEmployees', async () => {
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
        annualRevenue: g.groupByDimensionValues?.[2],
        avgEmployees: g.avgEmployees,
        totalCount: g.totalCount,
      }));

      expect(groupInfos).toEqual([
        {
          city: 'Anvers',
          dayOfWeek: 'Monday',
          avgEmployees: 19,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          avgEmployees: 3,
          totalCount: 2,
          annualRevenue: '100',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgEmployees: 19,
          totalCount: 1,
          annualRevenue: '105',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgEmployees: 20,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Dallas',
          dayOfWeek: 'Monday',
          avgEmployees: 2,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Paris',
          dayOfWeek: 'Thursday',
          avgEmployees: 10,
          totalCount: 1,
          annualRevenue: '100',
        },
      ]);
    });
    it('should order results in the right order - avgEmployees, createdAt, addressCity', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByAddressCreatedAtAndARR([
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
        annualRevenue: g.groupByDimensionValues?.[2],
        avgEmployees: g.avgEmployees,
        totalCount: g.totalCount,
      }));

      expect(groupInfos).toEqual([
        {
          city: 'Dallas',
          dayOfWeek: 'Monday',
          avgEmployees: 2,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Barcelona',
          dayOfWeek: 'Wednesday',
          avgEmployees: 3,
          totalCount: 2,
          annualRevenue: '100',
        },
        {
          city: 'Paris',
          dayOfWeek: 'Thursday',
          avgEmployees: 10,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Anvers',
          dayOfWeek: 'Monday',
          avgEmployees: 19,
          totalCount: 1,
          annualRevenue: '100',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgEmployees: 19,
          totalCount: 1,
          annualRevenue: '105',
        },
        {
          city: 'Cuzco',
          dayOfWeek: 'Monday',
          avgEmployees: 20,
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
        groupByAddressCreatedAtAndARR([{ employees: 'AscNullsFirst' }]),
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].message).toBe(
        'Cannot order by a field that is not an aggregate nor in groupBy criteria: employees.',
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
              avgEmployees: 'AscNullsFirst',
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
            employees: 'AscNullsFirst',
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

  describe('relation field ordering under target id group by', () => {
    const aardvarkCompanyId = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
    const mangoCompanyId = '99999999-9999-4999-8999-999999999999';
    const zebraCompanyId = '00000000-0000-4000-8000-000000000001';
    const alicePersonId = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
    const bobPersonId = '11111111-1111-4111-8111-111111111111';
    const carolPersonId = '22222222-2222-4222-8222-222222222222';
    const personWithoutCompanyId = '33333333-3333-4333-8333-333333333333';
    const aliceOpportunityId = randomUUID();
    const bobOpportunityId = randomUUID();

    beforeAll(async () => {
      const companies = [
        { id: aardvarkCompanyId, name: 'Aardvark' },
        { id: mangoCompanyId, name: 'Mango' },
        { id: zebraCompanyId, name: 'Zebra' },
      ];

      for (const company of companies) {
        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'company',
            gqlFields: COMPANY_GQL_FIELDS,
            data: company,
          }),
        );
      }

      const people = [
        {
          id: alicePersonId,
          name: { firstName: 'Alice', lastName: 'Brown' },
          companyId: aardvarkCompanyId,
        },
        {
          id: bobPersonId,
          name: { firstName: 'Bob', lastName: 'Johnson' },
          companyId: mangoCompanyId,
        },
        {
          id: carolPersonId,
          name: { firstName: 'Carol', lastName: 'Smith' },
          companyId: zebraCompanyId,
        },
        {
          id: personWithoutCompanyId,
          name: { firstName: 'Dave', lastName: 'Miller' },
        },
      ];

      for (const person of people) {
        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            data: person,
          }),
        );
      }

      const opportunities = [
        { id: aliceOpportunityId, pointOfContactId: alicePersonId },
        { id: bobOpportunityId, pointOfContactId: bobPersonId },
      ];

      for (const opportunity of opportunities) {
        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'opportunity',
            gqlFields: 'id',
            data: opportunity,
          }),
        );
      }
    });

    afterAll(async () => {
      for (const id of [aliceOpportunityId, bobOpportunityId]) {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'opportunity',
            gqlFields: 'id',
            recordId: id,
          }),
        );
      }

      for (const id of [
        alicePersonId,
        bobPersonId,
        carolPersonId,
        personWithoutCompanyId,
      ]) {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            recordId: id,
          }),
        );
      }

      for (const id of [aardvarkCompanyId, mangoCompanyId, zebraCompanyId]) {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'company',
            gqlFields: 'id',
            recordId: id,
          }),
        );
      }
    });

    it('should order groups by the related record TEXT label, not its id', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          groupBy: [{ companyId: true }],
          filter: {
            id: {
              in: [
                alicePersonId,
                bobPersonId,
                carolPersonId,
                personWithoutCompanyId,
              ],
            },
          },
          orderBy: [
            { company: { name: 'AscNullsLast' } },
            { company: { id: 'AscNullsLast' } },
          ],
        }),
      );

      expect(response.body.errors).toBeUndefined();

      const groups = response.body.data.peopleGroupBy;

      expect(
        groups.map((group: any) => group.groupByDimensionValues[0]),
      ).toEqual([aardvarkCompanyId, mangoCompanyId, zebraCompanyId, null]);
    });

    it('should order groups by the related record FULL_NAME label subfields', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'opportunity',
          objectMetadataPluralName: 'opportunities',
          groupBy: [{ pointOfContactId: true }],
          filter: {
            id: {
              in: [aliceOpportunityId, bobOpportunityId],
            },
          },
          orderBy: [
            { pointOfContact: { name: { firstName: 'AscNullsLast' } } },
            { pointOfContact: { name: { lastName: 'AscNullsLast' } } },
            { pointOfContact: { id: 'AscNullsLast' } },
          ],
        }),
      );

      expect(response.body.errors).toBeUndefined();

      const groups = response.body.data.opportunitiesGroupBy;

      expect(
        groups.map((group: any) => group.groupByDimensionValues[0]),
      ).toEqual([alicePersonId, bobPersonId]);
    });

    it('should fail when ordering by a relation absent from groupBy', async () => {
      const response = await makeGraphqlAPIRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          groupBy: [{ jobTitle: true }],
          orderBy: [{ company: { name: 'AscNullsLast' } }],
        }),
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].message).toBe(
        'Cannot order by a relation field that is not in groupBy criteria: company.name',
      );
    });
  });
});
