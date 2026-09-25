import { randomUUID } from 'crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { restoreOneOperationFactory } from 'test/integration/graphql/utils/restore-one-operation-factory.util';

const PERSON_WITH_COMPANY_GQL_FIELDS = `
  id
  companyId
  company {
    id
    name
  }
`;

describe('soft-deleted relation', () => {
  const companyId = randomUUID();
  const personId = randomUUID();

  beforeAll(async () => {
    await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id name',
        data: { id: companyId, name: 'SoftDeleteTestCompany' },
      }),
    );

    await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_WITH_COMPANY_GQL_FIELDS,
        data: {
          id: personId,
          companyId,
          name: { firstName: 'SoftDeleteTest' },
        },
      }),
    );
  });

  afterAll(async () => {
    await makeGraphqlApiRequest(
      restoreOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        recordId: companyId,
      }),
    );

    await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        recordId: personId,
      }),
    );

    await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        recordId: companyId,
      }),
    );
  });

  it('should return company relation when company is live', async () => {
    const response = await makeGraphqlApiRequest(
      findOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_WITH_COMPANY_GQL_FIELDS,
        filter: { id: { eq: personId } },
      }),
    );

    const person = response.body.data.person;

    expect(person.companyId).toBe(companyId);
    expect(person.company).toBeDefined();
    expect(person.company.id).toBe(companyId);
    expect(person.company.name).toBe('SoftDeleteTestCompany');
  });

  it('should nullify companyId when company is soft-deleted', async () => {
    await makeGraphqlApiRequest(
      deleteOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id deletedAt',
        recordId: companyId,
      }),
    );

    const response = await makeGraphqlApiRequest(
      findOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_WITH_COMPANY_GQL_FIELDS,
        filter: { id: { eq: personId } },
      }),
    );

    const person = response.body.data.person;

    expect(person.companyId).toBeNull();
    expect(person.company).toBeNull();
  });

  it('should restore company relation when company is restored', async () => {
    await makeGraphqlApiRequest(
      restoreOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id deletedAt',
        recordId: companyId,
      }),
    );

    const response = await makeGraphqlApiRequest(
      findOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_WITH_COMPANY_GQL_FIELDS,
        filter: { id: { eq: personId } },
      }),
    );

    const person = response.body.data.person;

    expect(person.companyId).toBe(companyId);
    expect(person.company).toBeDefined();
    expect(person.company.id).toBe(companyId);
  });
});
