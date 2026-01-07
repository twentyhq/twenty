import {
  TEST_COMPANY_1_ID,
  TEST_COMPANY_2_ID,
} from 'test/integration/constants/test-company-ids.constants';
import {
  TEST_PERSON_1_ID,
  TEST_PERSON_2_ID,
} from 'test/integration/constants/test-person-ids.constants';
import {
  TEST_PET_ID_1,
  TEST_PET_ID_2,
  TEST_PET_ID_3,
} from 'test/integration/constants/test-pet-ids.constants';
import { TEST_ROCKET_ID_1 } from 'test/integration/constants/test-rocket-ids.constants';
import { TEST_SURVEY_RESULT_1_ID } from 'test/integration/constants/test-survey-result-ids.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createManyOperation } from 'test/integration/graphql/utils/create-many-operation.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { type ObjectRecord } from 'twenty-shared/types';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const PERSON_GQL_FIELDS_WITH_COMPANY = `
  id
  city
  company {
    id
  }
`;

const PET_GQL_FIELDS_WITH_OWNER = `
  id
  name
  ownerSurveyResultId
  ownerSurveyResult {
    id
    name
  }
  ownerRocketId
  ownerRocket {
    id
    name
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

    await createManyOperation({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: 'id',
      data: [company1, company2],
    });
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

  it('should connect a morph relation ownerSurveyResult on pet via the connect feature', async () => {
    const PET_OBJECT_NAME = 'pet';
    const SURVEY_RESULT_OBJECT_NAME = 'surveyResult';
    const TEST_PET_ID = TEST_PET_ID_1;
    const TEST_SURVEY_RESULT_ID = TEST_SURVEY_RESULT_1_ID;

    // Create the survey result record first
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: SURVEY_RESULT_OBJECT_NAME,
        gqlFields: 'id',
        data: {
          id: TEST_SURVEY_RESULT_ID,
          name: 'Test Survey Result',
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: PET_OBJECT_NAME,
        gqlFields: 'id',
        data: {
          id: TEST_PET_ID,
          name: 'Test Pet',
        },
      }),
    );

    const updatePetOwnerSurveyResultOp = updateOneOperationFactory({
      objectMetadataSingularName: PET_OBJECT_NAME,
      recordId: TEST_PET_ID,
      gqlFields: PET_GQL_FIELDS_WITH_OWNER,
      data: {
        ownerSurveyResult: {
          connect: {
            where: { id: TEST_SURVEY_RESULT_ID },
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(updatePetOwnerSurveyResultOp);

    expect(response.body.data.updatePet).toBeDefined();
    expect(response.body.data.updatePet.ownerSurveyResult).toBeDefined();
    expect(response.body.data.updatePet.ownerSurveyResult.id).toBe(
      TEST_SURVEY_RESULT_ID,
    );
    expect(response.body.data.updatePet.ownerRocketId).toBeFalsy();
  });

  it('should disconnect a morph relation successfully', async () => {
    const PET_OBJECT_NAME = 'pet';
    const SURVEY_RESULT_OBJECT_NAME = 'surveyResult';
    const TEST_PET_ID = TEST_PET_ID_2;
    const TEST_SURVEY_RESULT_ID = TEST_SURVEY_RESULT_1_ID;

    // Create the survey result record first (if not already created by previous test)
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: SURVEY_RESULT_OBJECT_NAME,
        gqlFields: 'id',
        data: {
          id: TEST_SURVEY_RESULT_ID,
          name: 'Test Survey Result',
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: PET_OBJECT_NAME,
        gqlFields: 'id',
        data: {
          id: TEST_PET_ID,
          name: 'Test Pet 2',
        },
      }),
    );

    const updatePetOwnerSurveyResultOp = updateOneOperationFactory({
      objectMetadataSingularName: PET_OBJECT_NAME,
      recordId: TEST_PET_ID,
      gqlFields: PET_GQL_FIELDS_WITH_OWNER,
      data: {
        ownerSurveyResult: {
          connect: {
            where: { id: TEST_SURVEY_RESULT_ID },
          },
        },
      },
    });

    let response = await makeGraphqlAPIRequest(updatePetOwnerSurveyResultOp);

    expect(response.body.data.updatePet.ownerSurveyResult).toBeDefined();

    const updatePetOwnerSurveyResultDisconnectOp = updateOneOperationFactory({
      objectMetadataSingularName: PET_OBJECT_NAME,
      recordId: TEST_PET_ID,
      gqlFields: PET_GQL_FIELDS_WITH_OWNER,
      data: {
        ownerSurveyResult: {
          disconnect: true,
        },
      },
    });

    response = await makeGraphqlAPIRequest(
      updatePetOwnerSurveyResultDisconnectOp,
    );
    expect(response.body.data.updatePet.ownerSurveyResult).toBeFalsy();
  });

  // TODO: run this test when validations are implemented in commonAPI
  xit('should fail to create a morph relation on both target objects', async () => {
    const PET_OBJECT_NAME = 'pet';
    const TEST_PET_ID = TEST_PET_ID_3;
    const TEST_ROCKET_ID = TEST_ROCKET_ID_1;

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: PET_OBJECT_NAME,
        gqlFields: 'id',
        data: {
          id: TEST_PET_ID,
          name: 'Test Pet 3',
        },
      }),
    );

    const TEST_SURVEY_RESULT_ID = TEST_SURVEY_RESULT_1_ID;

    const updatePetOwnerSurveyResultOp = updateOneOperationFactory({
      objectMetadataSingularName: PET_OBJECT_NAME,
      recordId: TEST_PET_ID,
      gqlFields: PET_GQL_FIELDS_WITH_OWNER,
      data: {
        ownerSurveyResult: {
          connect: {
            where: { id: TEST_SURVEY_RESULT_ID },
          },
        },
        ownerRocket: {
          connect: {
            where: { id: TEST_ROCKET_ID },
          },
        },
      },
    });

    let response = await makeGraphqlAPIRequest(updatePetOwnerSurveyResultOp);

    expect(response.body.errors).toBeTruthy();
  });
});
