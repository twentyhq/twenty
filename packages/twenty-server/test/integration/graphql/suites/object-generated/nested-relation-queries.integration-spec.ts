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
import { createManyOperation } from 'test/integration/graphql/utils/create-many-operation.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { type ObjectRecord } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const PERSON_GQL_FIELDS_WITH_COMPANY = `
  id
  jobTitle
  company {
    id
  }
`;

const PET_GQL_FIELDS_WITH_OWNER = `
  id
  name
  polymorphicOwnerSurveyResultId
  polymorphicOwnerSurveyResult {
    id
    name
  }
  polymorphicOwnerRocketId
  polymorphicOwnerRocket {
    id
    name
  }
`;

const findRecordById = (
  objectMetadataSingularName: string,
  id: string,
  gqlFields = 'id',
) =>
  makeGraphqlAPIRequest(
    findOneOperationFactory({
      objectMetadataSingularName,
      gqlFields,
      filter: { id: { eq: id } },
    }),
  );

describe('relation connect in workspace createOne/createMany resolvers  (e2e)', () => {
  let generatedPersonIds: string[] = [];
  let generatedCompanyIds: string[] = [];
  let generatedPetIds: string[] = [];
  let generatedTaskTargetIds: string[] = [];
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

  afterEach(async () => {
    const cleanupOperations = [
      ['taskTarget', 'taskTargets', generatedTaskTargetIds],
      ['pet', 'pets', generatedPetIds],
      ['person', 'people', generatedPersonIds],
      ['company', 'companies', generatedCompanyIds],
    ] as const;

    for (const [nameSingular, namePlural, ids] of cleanupOperations) {
      if (ids.length === 0) {
        continue;
      }

      await makeGraphqlAPIRequest(
        destroyManyOperationFactory({
          objectMetadataSingularName: nameSingular,
          objectMetadataPluralName: namePlural,
          gqlFields: 'id',
          filter: { id: { in: ids } },
        }),
      );
    }

    generatedPersonIds = [];
    generatedCompanyIds = [];
    generatedPetIds = [];
    generatedTaskTargetIds = [];
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

  it('should create and connect a related record through a MANY-TO-ONE relation', async () => {
    const personId = v4();
    const companyId = v4();
    generatedPersonIds.push(personId);
    generatedCompanyIds.push(companyId);
    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
        data: {
          id: personId,
          company: {
            create: {
              id: companyId,
              name: 'Nested create company',
            },
          },
        },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createPerson.company.id).toBe(companyId);
  });

  it('should create and connect a related record with a generated target id', async () => {
    const personId = v4();

    generatedPersonIds.push(personId);

    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id jobTitle company { id name }',
        data: {
          id: personId,
          company: {
            create: {
              name: 'Nested create company with generated id',
            },
          },
        },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const companyId = response.body.data.createPerson.company.id;

    if (typeof companyId === 'string') {
      generatedCompanyIds.push(companyId);
    }

    const persistedPersonResponse = await findRecordById(
      'person',
      personId,
      PERSON_GQL_FIELDS_WITH_COMPANY,
    );

    expect(companyId).toEqual(expect.any(String));
    expect(persistedPersonResponse.body.data.person.company.id).toBe(companyId);
  });

  it('should preserve target mapping when creating multiple related records', async () => {
    const personIds = [v4(), v4()];
    const companyIds = [v4(), v4()];

    generatedPersonIds.push(...personIds);
    generatedCompanyIds.push(...companyIds);

    const response = await makeGraphqlAPIRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id jobTitle company { id name }',
        data: personIds.map((personId, index) => ({
          id: personId,
          company: {
            create: {
              id: companyIds[index],
              name: `Nested batch company ${index + 1}`,
            },
          },
        })),
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createPeople).toHaveLength(2);

    for (const [index, personId] of personIds.entries()) {
      const createdPerson = response.body.data.createPeople.find(
        (person: ObjectRecord) => person.id === personId,
      );

      expect(createdPerson.company).toMatchObject({
        id: companyIds[index],
        name: `Nested batch company ${index + 1}`,
      });
    }
  });

  it('should create and connect related records across both upsert branches', async () => {
    const existingPersonId = v4();
    const insertedPersonId = v4();
    const existingPersonCompanyId = v4();
    const insertedPersonCompanyId = v4();

    generatedPersonIds.push(existingPersonId, insertedPersonId);
    generatedCompanyIds.push(existingPersonCompanyId, insertedPersonCompanyId);

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        data: {
          id: existingPersonId,
          jobTitle: 'Preserved by nested upsert',
        },
      }),
    );

    const response = await makeGraphqlAPIRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
        data: [
          {
            id: existingPersonId,
            company: {
              create: {
                id: existingPersonCompanyId,
                name: 'Nested company for existing person',
              },
            },
          },
          {
            id: insertedPersonId,
            jobTitle: 'Inserted by nested upsert',
            company: {
              create: {
                id: insertedPersonCompanyId,
                name: 'Nested company for inserted person',
              },
            },
          },
        ],
        upsert: true,
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const upsertedPeopleById = new Map(
      response.body.data.createPeople.map((person: ObjectRecord) => [
        person.id,
        person,
      ]),
    );

    expect(upsertedPeopleById.get(existingPersonId)).toMatchObject({
      id: existingPersonId,
      jobTitle: 'Preserved by nested upsert',
      company: { id: existingPersonCompanyId },
    });
    expect(upsertedPeopleById.get(insertedPersonId)).toMatchObject({
      id: insertedPersonId,
      jobTitle: 'Inserted by nested upsert',
      company: { id: insertedPersonCompanyId },
    });
  });

  it('should create and connect a concrete target through a MANY-TO-ONE morph relation', async () => {
    const taskTargetId = v4();
    const personId = v4();
    generatedTaskTargetIds.push(taskTargetId);
    generatedPersonIds.push(personId);
    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'taskTarget',
        gqlFields: 'id targetPerson { id }',
        data: {
          id: taskTargetId,
          targetPerson: {
            create: { id: personId },
          },
        },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createTaskTarget.targetPerson.id).toBe(personId);
  });

  it('should preserve create-shaped values in RAW_JSON fields', async () => {
    const petId = v4();
    const extraData = { create: { arbitrary: 'json' } };

    generatedPetIds.push(petId);

    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'pet',
        gqlFields: 'id extraData',
        data: { id: petId, name: 'JSON nested-create regression', extraData },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createPet.extraData).toEqual(extraData);
  });

  it('should roll back a nested create when the parent record cannot be created', async () => {
    const personId = v4();
    const companyId = v4();
    generatedPersonIds.push(personId);
    generatedCompanyIds.push(companyId);

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        data: { id: personId },
      }),
    );

    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
        data: {
          id: personId,
          company: {
            create: {
              id: companyId,
              name: 'Must be rolled back',
            },
          },
        },
      }),
    );

    expect(response.body.errors).toBeDefined();

    const companyResponse = await findRecordById('company', companyId);

    expect(companyResponse.body.data.company).toBeNull();
  });

  it('should roll back every nested target when a create-many parent batch fails', async () => {
    const newPersonId = v4();
    const duplicatePersonId = v4();
    const companyIds = [v4(), v4()];

    generatedPersonIds.push(newPersonId, duplicatePersonId);
    generatedCompanyIds.push(...companyIds);

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        data: { id: duplicatePersonId },
      }),
    );

    const response = await makeGraphqlAPIRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
        data: [
          {
            id: newPersonId,
            company: {
              create: { id: companyIds[0], name: 'Rolled back company 1' },
            },
          },
          {
            id: duplicatePersonId,
            company: {
              create: { id: companyIds[1], name: 'Rolled back company 2' },
            },
          },
        ],
      }),
    );

    expect(response.body.errors).toBeDefined();

    const [newPersonResponse, firstCompanyResponse, secondCompanyResponse] =
      await Promise.all([
        findRecordById('person', newPersonId),
        findRecordById('company', companyIds[0]),
        findRecordById('company', companyIds[1]),
      ]);

    expect(newPersonResponse.body.data.person).toBeNull();
    expect(firstCompanyResponse.body.data.company).toBeNull();
    expect(secondCompanyResponse.body.data.company).toBeNull();
  });

  it('should reject nested create in update operations', async () => {
    const companyId = v4();

    generatedCompanyIds.push(companyId);

    const response = await makeGraphqlAPIRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        recordId: TEST_PERSON_1_ID,
        data: {
          company: {
            create: { id: companyId },
          },
        },
      }),
    );

    expect(response.body.errors).toBeDefined();

    const companyResponse = await findRecordById('company', companyId);

    expect(companyResponse.body.data.company).toBeNull();
  });

  it('should reject conflicting nested operations without creating an orphan target', async () => {
    const personId = v4();
    const companyId = v4();

    generatedPersonIds.push(personId);
    generatedCompanyIds.push(companyId);

    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
        data: {
          id: personId,
          company: {
            create: { id: companyId, name: 'Must not be created' },
            connect: { where: { id: TEST_COMPANY_1_ID } },
          },
        },
      }),
    );

    expect(response.body.errors?.[0].message).toBe(
      'Cannot combine create, connect, and disconnect for the same relation field company.',
    );

    const [personResponse, companyResponse] = await Promise.all([
      findRecordById('person', personId),
      findRecordById('company', companyId),
    ]);

    expect(personResponse.body.data.person).toBeNull();
    expect(companyResponse.body.data.company).toBeNull();
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
        jobTitle: 'existing-record',
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
          jobTitle: 'new-record',
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
    expect(updatedPerson.jobTitle).toBe('existing-record');

    expect(insertedPerson.company.id).toBe(TEST_COMPANY_1_ID);
    expect(insertedPerson.jobTitle).toBe('new-record');
  });

  it('should connect to other records through a MANY-TO-ONE relation - update One', async () => {
    const createPersonToUpdateOperation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS_WITH_COMPANY,
      data: {
        id: TEST_PERSON_1_ID,
        jobTitle: 'existing-record',
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
    expect(response.body.data.updatePerson.jobTitle).toBe('existing-record');
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
      "Missing required fields: at least one unique constraint have to be fully populated for 'company'.",
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
      'Cannot have both connect and disconnect for the same relation field company.',
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

  it('should connect a morph relation polymorphicOwnerSurveyResult on pet via the connect feature', async () => {
    const PET_OBJECT_NAME = 'pet';
    const SURVEY_RESULT_OBJECT_NAME = 'surveyResult';
    const TEST_PET_ID = TEST_PET_ID_1;
    const TEST_SURVEY_RESULT_ID = TEST_SURVEY_RESULT_1_ID;

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
        polymorphicOwnerSurveyResult: {
          connect: {
            where: { id: TEST_SURVEY_RESULT_ID },
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(updatePetOwnerSurveyResultOp);

    expect(response.body.data.updatePet).toBeDefined();
    expect(
      response.body.data.updatePet.polymorphicOwnerSurveyResult,
    ).toBeDefined();
    expect(response.body.data.updatePet.polymorphicOwnerSurveyResult.id).toBe(
      TEST_SURVEY_RESULT_ID,
    );
    expect(response.body.data.updatePet.polymorphicOwnerRocketId).toBeFalsy();
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
        polymorphicOwnerSurveyResult: {
          connect: {
            where: { id: TEST_SURVEY_RESULT_ID },
          },
        },
      },
    });

    let response = await makeGraphqlAPIRequest(updatePetOwnerSurveyResultOp);

    expect(
      response.body.data.updatePet.polymorphicOwnerSurveyResult,
    ).toBeDefined();

    const updatePetOwnerSurveyResultDisconnectOp = updateOneOperationFactory({
      objectMetadataSingularName: PET_OBJECT_NAME,
      recordId: TEST_PET_ID,
      gqlFields: PET_GQL_FIELDS_WITH_OWNER,
      data: {
        polymorphicOwnerSurveyResult: {
          disconnect: true,
        },
      },
    });

    response = await makeGraphqlAPIRequest(
      updatePetOwnerSurveyResultDisconnectOp,
    );
    expect(
      response.body.data.updatePet.polymorphicOwnerSurveyResult,
    ).toBeFalsy();
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
        polymorphicOwnerSurveyResult: {
          connect: {
            where: { id: TEST_SURVEY_RESULT_ID },
          },
        },
        polymorphicOwnerRocket: {
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
