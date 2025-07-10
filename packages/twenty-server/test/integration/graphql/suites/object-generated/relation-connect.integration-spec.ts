import {
  TEST_COMPANY_1_ID,
  TEST_COMPANY_2_ID,
} from 'test/integration/constants/test-company-ids.constants';
import {
  TEST_PERSON_1_ID,
  TEST_PERSON_2_ID,
} from 'test/integration/constants/test-person-ids.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const PERSON_GQL_FIELDS_WITH_COMPANY = `
  id
  company {
    id
  }
`;

describe('relation connect in workspace createOne/createMany resolvers  (e2e)', () => {
  beforeAll(async () => {
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: `id`,
      data: [
        {
          id: TEST_COMPANY_1_ID,
          domainName: { primaryLinkUrl: 'company1.com' },
        },
        {
          id: TEST_COMPANY_2_ID,
          domainName: { primaryLinkUrl: 'company2.com' },
        },
      ],
    });

    await makeGraphqlAPIRequest(graphqlOperation);
  });

  beforeEach(async () => {
    await deleteAllRecords('person');
  });

  afterAll(async () => {
    await deleteAllRecords('company');
    await deleteAllRecords('person');
  });

  it('should connect to other records through a MANY-TO-ONE relation - create One', async () => {
    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      data: {
        id: TEST_PERSON_1_ID,
        company: {
          connect: {
            where: { domainName: { primaryLinkUrl: 'company1.com' } },
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createPerson).toBeDefined();
    expect(response.body.data.createPerson.id).toBe(TEST_PERSON_1_ID);
    expect(response.body.data.createPerson.company.id).toBe(TEST_COMPANY_1_ID);
  });

  it('should connect to other records through a MANY-TO-ONE relation - create Many', async () => {
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      data: [
        {
          id: TEST_PERSON_1_ID,
          company: {
            connect: {
              where: { domainName: { primaryLinkUrl: 'company1.com' } },
            },
          },
        },
        {
          id: TEST_PERSON_2_ID,
          company: {
            connect: {
              where: { domainName: { primaryLinkUrl: 'company2.com' } },
            },
          },
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createPeople).toBeDefined();
    expect(response.body.data.createPeople).toHaveLength(2);
    expect(response.body.data.createPeople[0].company.id).toBe(
      TEST_COMPANY_1_ID,
    );
    expect(response.body.data.createPeople[1].company.id).toBe(
      TEST_COMPANY_2_ID,
    );
  });

  it('should throw an error if relation id field and relation connect field are both provided', async () => {
    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      data: {
        id: TEST_PERSON_1_ID,
        companyId: TEST_COMPANY_1_ID,
        company: {
          connect: {
            where: { domainName: { primaryLinkUrl: 'company1.com' } },
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      'company and companyId cannot be both provided.',
    );
    expect(response.body.errors[0].extensions.code).toBe(
      ErrorCode.BAD_USER_INPUT,
    );
  });

  it('should throw an error if record to connect to does not exist', async () => {
    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      data: {
        id: TEST_PERSON_1_ID,
        company: {
          connect: {
            where: { domainName: { primaryLinkUrl: 'not-existing-company' } },
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      'Expected 1 record to connect to company, but found 0.',
    );
    expect(response.body.errors[0].extensions.code).toBe(
      ErrorCode.BAD_USER_INPUT,
    );
  });

  it('should throw an error if unique constraint is not the same for all created records', async () => {
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      data: [
        {
          id: TEST_PERSON_1_ID,
          company: {
            connect: {
              where: { domainName: { primaryLinkUrl: 'company1.com' } },
            },
          },
        },
        {
          id: TEST_PERSON_2_ID,
          company: {
            connect: {
              where: { id: TEST_COMPANY_2_ID },
            },
          },
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      'Expected the same constraint fields to be used consistently across all operations for company.',
    );
    expect(response.body.errors[0].extensions.code).toBe(
      ErrorCode.BAD_USER_INPUT,
    );
  });

  it('should throw an error if connect field is not set with field from unique constraint', async () => {
    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      data: {
        id: TEST_PERSON_1_ID,
        company: {
          connect: {
            where: { name: 'company1' },
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      'Field "name" is not defined by type "CompanyWhereUniqueInput".',
    );
    expect(response.body.errors[0].extensions.code).toBe(
      ErrorCode.BAD_USER_INPUT,
    );
  });
});
