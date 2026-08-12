import { randomUUID } from 'crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { restoreOneOperationFactory } from 'test/integration/graphql/utils/restore-one-operation-factory.util';

const PERSON_GQL_FIELDS = `
  id
  name {
    firstName
    lastName
  }
  companyId
  company {
    id
    name
    domainName {
      primaryLinkUrl
    }
  }
`;

describe('find one record', () => {
  const companyId = randomUUID();
  const personId = randomUUID();
  // Unique per run so the company domainName unique index cannot collide with
  // another suite sharing the same reset database.
  const primaryLinkUrl = `https://find-one-${companyId}.test/`;
  const primaryLinkUrlWithoutTrailingSlash = primaryLinkUrl.slice(0, -1);

  beforeAll(async () => {
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id name',
        data: {
          id: companyId,
          name: 'FindOneTestCompany',
          domainName: { primaryLinkUrl },
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: {
          id: personId,
          companyId,
          name: { firstName: 'FindOne', lastName: 'Tester' },
        },
      }),
    );
  });

  afterAll(async () => {
    // The last test leaves the person soft-deleted; restore before destroying.
    await makeGraphqlAPIRequest(
      restoreOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        recordId: personId,
      }),
    );

    await makeGraphqlAPIRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        recordId: personId,
      }),
    );

    await makeGraphqlAPIRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        recordId: companyId,
      }),
    );
  });

  it('should retrieve a record by id with composite fields and its to-one relation', async () => {
    const response = await makeGraphqlAPIRequest(
      findOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        filter: { id: { eq: personId } },
      }),
    );

    const person = response.body.data.person;

    expect(person.id).toBe(personId);
    expect(person.name.firstName).toBe('FindOne');
    expect(person.name.lastName).toBe('Tester');
    expect(person.companyId).toBe(companyId);
    expect(person.company.id).toBe(companyId);
    expect(person.company.name).toBe('FindOneTestCompany');
    expect(person.company.domainName.primaryLinkUrl).toBe(
      primaryLinkUrlWithoutTrailingSlash,
    );
  });

  it('should return null when the record does not exist', async () => {
    const response = await makeGraphqlAPIRequest(
      findOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        filter: { id: { eq: randomUUID() } },
      }),
    );

    expect(response.body.data.person).toBeNull();
  });

  it('should exclude soft-deleted records by default', async () => {
    await makeGraphqlAPIRequest(
      deleteOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id deletedAt',
        recordId: personId,
      }),
    );

    const response = await makeGraphqlAPIRequest(
      findOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        filter: { id: { eq: personId } },
      }),
    );

    expect(response.body.data.person).toBeNull();
  });

  it('should retrieve a soft-deleted record with a deletedAt filter', async () => {
    const response = await makeGraphqlAPIRequest(
      findOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        filter: {
          id: { eq: personId },
          not: { deletedAt: { is: 'NULL' } },
        },
      }),
    );

    const person = response.body.data.person;

    expect(person.id).toBe(personId);
    expect(person.name.firstName).toBe('FindOne');
  });
});
