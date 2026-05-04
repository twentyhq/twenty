import { randomUUID } from 'node:crypto';

import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

const PERSON_WITH_COMPANY_GQL_FIELDS = `
    id
    companyId
    name {
      firstName
      lastName
    }
`;

describe('relationOnDeleteNullifyFkOnSoftDelete', () => {
  it('should nullify person.companyId when the related company is soft-deleted', async () => {
    const companyId = randomUUID();
    const personId = randomUUID();

    const createCompanyOperation = createOneOperationFactory({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      data: {
        id: companyId,
        name: 'Test Company For Soft Delete',
      },
    });

    await makeGraphqlAPIRequest(createCompanyOperation);

    const createPersonOperation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_WITH_COMPANY_GQL_FIELDS,
      data: {
        id: personId,
        companyId,
        name: { firstName: 'Test', lastName: 'Person' },
      },
    });

    const createPersonResponse =
      await makeGraphqlAPIRequest(createPersonOperation);

    expect(createPersonResponse.body.data.createPerson.companyId).toBe(
      companyId,
    );

    const deleteCompanyOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      recordId: companyId,
    });

    await makeGraphqlAPIRequest(deleteCompanyOperation);

    const findPersonOperation = findOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_WITH_COMPANY_GQL_FIELDS,
      filter: { id: { eq: personId } },
    });

    const findPersonResponse =
      await makeGraphqlAPIRequest(findPersonOperation);

    expect(findPersonResponse.body.data.person.companyId).toBeNull();
  });

  it('should nullify opportunity.companyId when the related company is soft-deleted', async () => {
    const companyId = randomUUID();
    const opportunityId = randomUUID();

    const createCompanyOperation = createOneOperationFactory({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      data: {
        id: companyId,
        name: 'Test Company For Opportunity',
      },
    });

    await makeGraphqlAPIRequest(createCompanyOperation);

    const createOpportunityOperation = createOneOperationFactory({
      objectMetadataSingularName: 'opportunity',
      gqlFields: `id companyId`,
      data: {
        id: opportunityId,
        companyId,
      },
    });

    const createOpportunityResponse = await makeGraphqlAPIRequest(
      createOpportunityOperation,
    );

    expect(
      createOpportunityResponse.body.data.createOpportunity.companyId,
    ).toBe(companyId);

    const deleteCompanyOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      recordId: companyId,
    });

    await makeGraphqlAPIRequest(deleteCompanyOperation);

    const findOpportunityOperation = findOneOperationFactory({
      objectMetadataSingularName: 'opportunity',
      gqlFields: `id companyId`,
      filter: { id: { eq: opportunityId } },
    });

    const findOpportunityResponse = await makeGraphqlAPIRequest(
      findOpportunityOperation,
    );

    expect(
      findOpportunityResponse.body.data.opportunity.companyId,
    ).toBeNull();
  });

  it('should NOT nullify FK when relation has CASCADE onDelete (e.g., taskTarget.taskId)', async () => {
    const taskId = randomUUID();
    const taskTargetId = randomUUID();
    const personId = randomUUID();

    const createPersonOperation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: `id`,
      data: { id: personId, name: { firstName: 'FK', lastName: 'Test' } },
    });

    await makeGraphqlAPIRequest(createPersonOperation);

    const createTaskOperation = createOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: `id`,
      data: { id: taskId },
    });

    await makeGraphqlAPIRequest(createTaskOperation);

    const createTaskTargetOperation = createOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: `id taskId personId`,
      data: {
        id: taskTargetId,
        taskId,
        personId,
      },
    });

    const createTaskTargetResponse = await makeGraphqlAPIRequest(
      createTaskTargetOperation,
    );

    expect(
      createTaskTargetResponse.body.data.createTaskTarget.taskId,
    ).toBe(taskId);

    const deleteTaskOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: `id`,
      recordId: taskId,
    });

    await makeGraphqlAPIRequest(deleteTaskOperation);

    // taskTarget has CASCADE onDelete for taskId, so the FK should remain
    // (CASCADE would hard-delete the child, but soft-delete doesn't cascade)
    const findTaskTargetOperation = findOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: `id taskId`,
      filter: { id: { eq: taskTargetId } },
    });

    const findTaskTargetResponse = await makeGraphqlAPIRequest(
      findTaskTargetOperation,
    );

    expect(findTaskTargetResponse.body.data.taskTarget.taskId).toBe(
      taskId,
    );
  });
});
