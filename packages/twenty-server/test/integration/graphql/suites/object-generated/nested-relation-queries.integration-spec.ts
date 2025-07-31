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
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { performCreateManyOperation } from 'test/integration/graphql/utils/perform-create-many-operation.utils';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const PERSON_GQL_FIELDS_WITH_COMPANY = `
  id
  city
  company {
    id
  }
`;

describe('relation connect in workspace createOne/createMany resolvers  (e2e)', () => {
  const [company1, company2] = [
    { id: TEST_COMPANY_1_ID, domainName: { primaryLinkUrl: 'company1.com' } },
    { id: TEST_COMPANY_2_ID, domainName: { primaryLinkUrl: 'company2.com' } },
  ];

  beforeAll(async () => {
    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: `id`,
        filter: {
          id: {
            in: [TEST_COMPANY_1_ID, TEST_COMPANY_2_ID],
          },
        },
      }),
    );

    await performCreateManyOperation('company', 'companies', `id`, [
      company1,
      company2,
    ]);
  });

  beforeEach(async () => {
    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: `id`,
        filter: {
          id: {
            in: [TEST_PERSON_1_ID, TEST_PERSON_2_ID],
          },
        },
      }),
    );
  });

  afterAll(async () => {
    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: `id`,
        filter: {
          id: {
            in: [TEST_COMPANY_1_ID, TEST_COMPANY_2_ID],
          },
        },
      }),
    );
    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: `id`,
        filter: {
          id: {
            in: [TEST_PERSON_1_ID, TEST_PERSON_2_ID],
          },
        },
      }),
    );
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

  it('should connect to other records through a MANY-TO-ONE relation - create Many - upsert false', async () => {
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

  it('should connect to other records through a MANY-TO-ONE relation - create Many - upsert true', async () => {
    const createPersonToUpdateOperation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      data: {
        id: TEST_PERSON_1_ID,
        city: 'existing-record',
        companyId: TEST_COMPANY_1_ID,
      },
    });

    await makeGraphqlAPIRequest(createPersonToUpdateOperation);

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      data: [
        {
          id: TEST_PERSON_1_ID,
          company: {
            connect: {
              where: { domainName: { primaryLinkUrl: 'company2.com' } },
            },
          },
        },
        {
          id: TEST_PERSON_2_ID,
          city: 'new-record',
          company: {
            connect: {
              where: { domainName: { primaryLinkUrl: 'company1.com' } },
            },
          },
        },
      ],
      upsert: true,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createPeople).toBeDefined();
    expect(response.body.data.createPeople).toHaveLength(2);

    const updatedPerson = response.body.data.createPeople.find(
      (person: ObjectRecord) => person.id === TEST_PERSON_1_ID,
    );

    const insertedPerson = response.body.data.createPeople.find(
      (person: ObjectRecord) => person.id === TEST_PERSON_2_ID,
    );

    expect(updatedPerson.company.id).toBe(TEST_COMPANY_2_ID);
    expect(updatedPerson.city).toBe('existing-record');

    expect(insertedPerson.company.id).toBe(TEST_COMPANY_1_ID);
    expect(insertedPerson.city).toBe('new-record');
  });

  it('should connect to other records through a MANY-TO-ONE relation - update One', async () => {
    const createPersonToUpdateOperation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      data: {
        id: TEST_PERSON_1_ID,
        city: 'existing-record',
        companyId: TEST_COMPANY_1_ID,
      },
    });

    await makeGraphqlAPIRequest(createPersonToUpdateOperation);

    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      recordId: TEST_PERSON_1_ID,
      data: {
        company: {
          connect: {
            where: { domainName: { primaryLinkUrl: 'company2.com' } },
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.updatePerson).toBeDefined();
    expect(response.body.data.updatePerson.company.id).toBe(TEST_COMPANY_2_ID);
    expect(response.body.data.updatePerson.city).toBe('existing-record');
  });

  it('should connect to other records through a MANY-TO-ONE relation - update Many', async () => {
    const createPeopleToUpdateOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      data: [
        {
          id: TEST_PERSON_1_ID,
          companyId: TEST_COMPANY_1_ID,
        },
        {
          id: TEST_PERSON_2_ID,
        },
      ],
    });

    await makeGraphqlAPIRequest(createPeopleToUpdateOperation);

    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      filter: {
        id: {
          in: [TEST_PERSON_1_ID, TEST_PERSON_2_ID],
        },
      },
      data: {
        company: {
          connect: {
            where: { domainName: { primaryLinkUrl: 'company2.com' } },
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.updatePeople).toBeDefined();
    expect(response.body.data.updatePeople).toHaveLength(2);

    expect(response.body.data.updatePeople[0].company.id).toBe(
      TEST_COMPANY_2_ID,
    );
    expect(response.body.data.updatePeople[1].company.id).toBe(
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
      'Expected 1 record to connect to company, but found 0 for domainNamePrimaryLinkUrl = not-existing-company',
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

  it('should throw an error if connect and disconnect are both provided', async () => {
    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      data: {
        id: TEST_PERSON_1_ID,
        company: {
          connect: {
            where: { domainName: { primaryLinkUrl: 'company1.com' } },
          },
          disconnect: true,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      'Cannot have both connect and disconnect for the same field on undefined.',
    );
  });

  it('should disconnect a record from a MANY-TO-ONE relation - update One', async () => {
    const createPersonToUpdateOperation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      data: {
        id: TEST_PERSON_1_ID,
        companyId: TEST_COMPANY_1_ID,
      },
    });

    await makeGraphqlAPIRequest(createPersonToUpdateOperation);

    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      recordId: TEST_PERSON_1_ID,
      data: {
        company: {
          disconnect: true,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.updatePerson).toBeDefined();
    expect(response.body.data.updatePerson.company?.id).toBeUndefined();
  });

  it('should not disconnect a record from a MANY-TO-ONE relation - update One', async () => {
    const createPersonToUpdateOperation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      data: {
        id: TEST_PERSON_1_ID,
        companyId: TEST_COMPANY_1_ID,
      },
    });

    await makeGraphqlAPIRequest(createPersonToUpdateOperation);

    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      recordId: TEST_PERSON_1_ID,
      data: {
        company: {
          disconnect: false,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.updatePerson).toBeDefined();
    expect(response.body.data.updatePerson.company?.id).toBe(TEST_COMPANY_1_ID);
  });
  it('should disconnect a record from a MANY-TO-ONE relation - update Many', async () => {
    const createPeopleToUpdateOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      data: [
        {
          id: TEST_PERSON_1_ID,
          companyId: TEST_COMPANY_1_ID,
        },
        {
          id: TEST_PERSON_2_ID,
          companyId: TEST_COMPANY_2_ID,
        },
      ],
    });

    await makeGraphqlAPIRequest(createPeopleToUpdateOperation);

    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      filter: {
        id: {
          in: [TEST_PERSON_1_ID, TEST_PERSON_2_ID],
        },
      },
      data: {
        company: {
          disconnect: true,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.updatePeople).toBeDefined();
    expect(response.body.data.updatePeople).toHaveLength(2);

    expect(response.body.data.updatePeople[0].company?.id).toBeUndefined();
    expect(response.body.data.updatePeople[1].company?.id).toBeUndefined();
  });
  it('should disconnect a record from a MANY-TO-ONE relation - create Many - upsert true', async () => {
    const createPersonToUpdateOperation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      data: {
        id: TEST_PERSON_1_ID,
        companyId: TEST_COMPANY_1_ID,
      },
    });

    await makeGraphqlAPIRequest(createPersonToUpdateOperation);

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      data: [
        {
          id: TEST_PERSON_1_ID,
          company: {
            disconnect: true,
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
      upsert: true,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createPeople).toBeDefined();
    expect(response.body.data.createPeople).toHaveLength(2);

    const updatedPerson = response.body.data.createPeople.find(
      (person: ObjectRecord) => person.id === TEST_PERSON_1_ID,
    );

    const insertedPerson = response.body.data.createPeople.find(
      (person: ObjectRecord) => person.id === TEST_PERSON_2_ID,
    );

    expect(updatedPerson.company?.id).toBeUndefined();
    expect(insertedPerson.company?.id).toBe(TEST_COMPANY_2_ID);
  });
});
