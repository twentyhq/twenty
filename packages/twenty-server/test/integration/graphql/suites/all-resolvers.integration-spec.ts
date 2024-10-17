import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

const COMPANY_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const COMPANY_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const COMPANY_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';
const COMPANY_GQL_FIELDS = `
    id
    name
    employees
    idealCustomerProfile
    position
    createdAt
    updatedAt
    deletedAt
    accountOwnerId
    tagline
    workPolicy
    visaSponsorship
`;

describe('companies resolvers (integration)', () => {
  it('1. should create and return companies', async () => {
    const companyName1 = generateRecordName(COMPANY_1_ID);
    const companyName2 = generateRecordName(COMPANY_2_ID);

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: COMPANY_GQL_FIELDS,
      data: [
        {
          id: COMPANY_1_ID,
          name: companyName1,
        },
        {
          id: COMPANY_2_ID,
          name: companyName2,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createCompanies).toHaveLength(2);

    response.body.data.createCompanies.forEach((company) => {
      expect(company).toHaveProperty('name');
      expect([companyName1, companyName2]).toContain(company.name);

      expect(company).toHaveProperty('employees');
      expect(company).toHaveProperty('idealCustomerProfile');
      expect(company).toHaveProperty('position');
      expect(company).toHaveProperty('id');
      expect(company).toHaveProperty('createdAt');
      expect(company).toHaveProperty('updatedAt');
      expect(company).toHaveProperty('deletedAt');
      expect(company).toHaveProperty('accountOwnerId');
      expect(company).toHaveProperty('tagline');
      expect(company).toHaveProperty('workPolicy');
      expect(company).toHaveProperty('visaSponsorship');
    });
  });

  it('1b. should create and return one company', async () => {
    const companyName = generateRecordName(COMPANY_3_ID);

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      data: {
        id: COMPANY_3_ID,
        name: companyName,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdCompany = response.body.data.createCompany;

    expect(createdCompany).toHaveProperty('name');
    expect(createdCompany.name).toEqual(companyName);

    expect(createdCompany).toHaveProperty('employees');
    expect(createdCompany).toHaveProperty('idealCustomerProfile');
    expect(createdCompany).toHaveProperty('position');
    expect(createdCompany).toHaveProperty('id');
    expect(createdCompany).toHaveProperty('createdAt');
    expect(createdCompany).toHaveProperty('updatedAt');
    expect(createdCompany).toHaveProperty('deletedAt');
    expect(createdCompany).toHaveProperty('accountOwnerId');
    expect(createdCompany).toHaveProperty('tagline');
    expect(createdCompany).toHaveProperty('workPolicy');
    expect(createdCompany).toHaveProperty('visaSponsorship');
  });

  it('2. should find many companies', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: COMPANY_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.companies;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    const edges = data.edges;

    if (edges.length > 0) {
      const companies = edges[0].node;

      expect(companies).toHaveProperty('name');
      expect(companies).toHaveProperty('employees');
      expect(companies).toHaveProperty('idealCustomerProfile');
      expect(companies).toHaveProperty('position');
      expect(companies).toHaveProperty('id');
      expect(companies).toHaveProperty('createdAt');
      expect(companies).toHaveProperty('updatedAt');
      expect(companies).toHaveProperty('deletedAt');
      expect(companies).toHaveProperty('accountOwnerId');
      expect(companies).toHaveProperty('tagline');
      expect(companies).toHaveProperty('workPolicy');
      expect(companies).toHaveProperty('visaSponsorship');
    }
  });

  it('2b. should find one company', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      filter: {
        id: {
          eq: COMPANY_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const company = response.body.data.company;

    expect(company).toHaveProperty('name');

    expect(company).toHaveProperty('employees');
    expect(company).toHaveProperty('idealCustomerProfile');
    expect(company).toHaveProperty('position');
    expect(company).toHaveProperty('id');
    expect(company).toHaveProperty('createdAt');
    expect(company).toHaveProperty('updatedAt');
    expect(company).toHaveProperty('deletedAt');
    expect(company).toHaveProperty('accountOwnerId');
    expect(company).toHaveProperty('tagline');
    expect(company).toHaveProperty('workPolicy');
    expect(company).toHaveProperty('visaSponsorship');
  });

  it('3. should update many companies', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: COMPANY_GQL_FIELDS,
      data: {
        employees: 123,
      },
      filter: {
        id: {
          in: [COMPANY_1_ID, COMPANY_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedCompanies = response.body.data.updateCompanies;

    expect(updatedCompanies).toHaveLength(2);

    updatedCompanies.forEach((company) => {
      expect(company.employees).toEqual(123);
    });
  });

  it('3b. should update one company', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      data: {
        employees: 122,
      },
      recordId: COMPANY_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedCompany = response.body.data.updateCompany;

    expect(updatedCompany.employees).toEqual(122);
  });

  it('4. should find many companies with updated employees', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: COMPANY_GQL_FIELDS,
      filter: {
        employees: {
          eq: 123,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.companies.edges).toHaveLength(2);
  });

  it('4b. should find one company with updated employees', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      filter: {
        employees: {
          eq: 122,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.company.employees).toEqual(122);
  });

  it('5. should delete many companies', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: COMPANY_GQL_FIELDS,
      filter: {
        id: {
          in: [COMPANY_1_ID, COMPANY_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deleteCompanies = response.body.data.deleteCompanies;

    expect(deleteCompanies).toHaveLength(2);

    deleteCompanies.forEach((company) => {
      expect(company.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one company', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      recordId: COMPANY_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteCompany.deletedAt).toBeTruthy();
  });

  it('6. should not find many companies anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: COMPANY_GQL_FIELDS,
      filter: {
        id: {
          in: [COMPANY_1_ID, COMPANY_2_ID],
        },
      },
    });

    const findCompaniesResponse = await makeGraphqlAPIRequest(graphqlOperation);

    expect(findCompaniesResponse.body.data.companies.edges).toHaveLength(0);
  });

  it('6b. should not find one company anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      filter: {
        id: {
          eq: COMPANY_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.company).toBeNull();
  });

  it('7. should find many deleted companies with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: COMPANY_GQL_FIELDS,
      filter: {
        id: {
          in: [COMPANY_1_ID, COMPANY_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.companies.edges).toHaveLength(2);
  });

  it('7b. should find one deleted company with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      filter: {
        id: {
          eq: COMPANY_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.company.id).toEqual(COMPANY_3_ID);
  });

  it('8. should destroy many companies', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: COMPANY_GQL_FIELDS,
      filter: {
        id: {
          in: [COMPANY_1_ID, COMPANY_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyCompanies).toHaveLength(2);
  });

  it('8b. should destroy one company', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      recordId: COMPANY_3_ID,
    });

    const destroyCompanyResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(destroyCompanyResponse.body.data.destroyCompany).toBeTruthy();
  });

  it('9. should not find many companies anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: COMPANY_GQL_FIELDS,
      filter: {
        id: {
          in: [COMPANY_1_ID, COMPANY_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.companies.edges).toHaveLength(0);
  });

  it('9b. should not find one company anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      filter: {
        id: {
          eq: COMPANY_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.company).toBeNull();
  });
});
