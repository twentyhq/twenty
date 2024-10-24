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

const AUDIT_LOG_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const AUDIT_LOG_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const AUDIT_LOG_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';

const AUDIT_LOG_GQL_FIELDS = `
    id
    name
    properties
    context
    objectName
    objectMetadataId
    recordId
    createdAt
    updatedAt
    deletedAt
    workspaceMemberId
`;

describe('auditLogs resolvers (integration)', () => {
  it('1. should create and return auditLogs', async () => {
    const auditLogName1 = generateRecordName(AUDIT_LOG_1_ID);
    const auditLogName2 = generateRecordName(AUDIT_LOG_2_ID);

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'auditLog',
      objectMetadataPluralName: 'auditLogs',
      gqlFields: AUDIT_LOG_GQL_FIELDS,
      data: [
        {
          id: AUDIT_LOG_1_ID,
          name: auditLogName1,
        },
        {
          id: AUDIT_LOG_2_ID,
          name: auditLogName2,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createAuditLogs).toHaveLength(2);

    response.body.data.createAuditLogs.forEach((auditLog) => {
      expect(auditLog).toHaveProperty('name');
      expect([auditLogName1, auditLogName2]).toContain(auditLog.name);
      expect(auditLog).toHaveProperty('properties');
      expect(auditLog).toHaveProperty('context');
      expect(auditLog).toHaveProperty('objectName');
      expect(auditLog).toHaveProperty('objectMetadataId');
      expect(auditLog).toHaveProperty('recordId');
      expect(auditLog).toHaveProperty('id');
      expect(auditLog).toHaveProperty('createdAt');
      expect(auditLog).toHaveProperty('updatedAt');
      expect(auditLog).toHaveProperty('deletedAt');
      expect(auditLog).toHaveProperty('workspaceMemberId');
    });
  });

  it('1b. should create and return one auditLog', async () => {
    const auditLogName = generateRecordName(AUDIT_LOG_3_ID);

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'auditLog',
      gqlFields: AUDIT_LOG_GQL_FIELDS,
      data: {
        id: AUDIT_LOG_3_ID,
        name: auditLogName,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdAuditLog = response.body.data.createAuditLog;

    expect(createdAuditLog).toHaveProperty('name');
    expect(createdAuditLog.name).toEqual(auditLogName);
    expect(createdAuditLog).toHaveProperty('properties');
    expect(createdAuditLog).toHaveProperty('context');
    expect(createdAuditLog).toHaveProperty('objectName');
    expect(createdAuditLog).toHaveProperty('objectMetadataId');
    expect(createdAuditLog).toHaveProperty('recordId');
    expect(createdAuditLog).toHaveProperty('id');
    expect(createdAuditLog).toHaveProperty('createdAt');
    expect(createdAuditLog).toHaveProperty('updatedAt');
    expect(createdAuditLog).toHaveProperty('deletedAt');
    expect(createdAuditLog).toHaveProperty('workspaceMemberId');
  });

  it('2. should find many auditLogs', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'auditLog',
      objectMetadataPluralName: 'auditLogs',
      gqlFields: AUDIT_LOG_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.auditLogs;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    if (data.edges.length > 0) {
      const auditLogs = data.edges[0].node;

      expect(auditLogs).toHaveProperty('name');
      expect(auditLogs).toHaveProperty('properties');
      expect(auditLogs).toHaveProperty('context');
      expect(auditLogs).toHaveProperty('objectName');
      expect(auditLogs).toHaveProperty('objectMetadataId');
      expect(auditLogs).toHaveProperty('recordId');
      expect(auditLogs).toHaveProperty('id');
      expect(auditLogs).toHaveProperty('createdAt');
      expect(auditLogs).toHaveProperty('updatedAt');
      expect(auditLogs).toHaveProperty('deletedAt');
      expect(auditLogs).toHaveProperty('workspaceMemberId');
    }
  });

  it('2b. should find one auditLog', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'auditLog',
      gqlFields: AUDIT_LOG_GQL_FIELDS,
      filter: {
        id: {
          eq: AUDIT_LOG_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const auditLog = response.body.data.auditLog;

    expect(auditLog).toHaveProperty('name');
    expect(auditLog).toHaveProperty('properties');
    expect(auditLog).toHaveProperty('context');
    expect(auditLog).toHaveProperty('objectName');
    expect(auditLog).toHaveProperty('objectMetadataId');
    expect(auditLog).toHaveProperty('recordId');
    expect(auditLog).toHaveProperty('id');
    expect(auditLog).toHaveProperty('createdAt');
    expect(auditLog).toHaveProperty('updatedAt');
    expect(auditLog).toHaveProperty('deletedAt');
    expect(auditLog).toHaveProperty('workspaceMemberId');
  });

  it('3. should update many auditLogs', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'auditLog',
      objectMetadataPluralName: 'auditLogs',
      gqlFields: AUDIT_LOG_GQL_FIELDS,
      data: {
        name: 'Updated Name',
      },
      filter: {
        id: {
          in: [AUDIT_LOG_1_ID, AUDIT_LOG_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedAuditLogs = response.body.data.updateAuditLogs;

    expect(updatedAuditLogs).toHaveLength(2);

    updatedAuditLogs.forEach((auditLog) => {
      expect(auditLog.name).toEqual('Updated Name');
    });
  });

  it('3b. should update one auditLog', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'auditLog',
      gqlFields: AUDIT_LOG_GQL_FIELDS,
      data: {
        name: 'New Name',
      },
      recordId: AUDIT_LOG_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedAuditLog = response.body.data.updateAuditLog;

    expect(updatedAuditLog.name).toEqual('New Name');
  });

  it('4. should find many auditLogs with updated name', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'auditLog',
      objectMetadataPluralName: 'auditLogs',
      gqlFields: AUDIT_LOG_GQL_FIELDS,
      filter: {
        name: {
          eq: 'Updated Name',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.auditLogs.edges).toHaveLength(2);
  });

  it('4b. should find one auditLog with updated name', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'auditLog',
      gqlFields: AUDIT_LOG_GQL_FIELDS,
      filter: {
        name: {
          eq: 'New Name',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.auditLog.name).toEqual('New Name');
  });

  it('5. should delete many auditLogs', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'auditLog',
      objectMetadataPluralName: 'auditLogs',
      gqlFields: AUDIT_LOG_GQL_FIELDS,
      filter: {
        id: {
          in: [AUDIT_LOG_1_ID, AUDIT_LOG_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deletedAuditLogs = response.body.data.deleteAuditLogs;

    expect(deletedAuditLogs).toHaveLength(2);

    deletedAuditLogs.forEach((auditLog) => {
      expect(auditLog.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one auditLog', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'auditLog',
      gqlFields: AUDIT_LOG_GQL_FIELDS,
      recordId: AUDIT_LOG_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteAuditLog.deletedAt).toBeTruthy();
  });

  it('6. should not find many auditLogs anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'auditLog',
      objectMetadataPluralName: 'auditLogs',
      gqlFields: AUDIT_LOG_GQL_FIELDS,
      filter: {
        id: {
          in: [AUDIT_LOG_1_ID, AUDIT_LOG_2_ID],
        },
      },
    });

    const findAuditLogsResponse = await makeGraphqlAPIRequest(graphqlOperation);

    expect(findAuditLogsResponse.body.data.auditLogs.edges).toHaveLength(0);
  });

  it('6b. should not find one auditLog anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'auditLog',
      gqlFields: AUDIT_LOG_GQL_FIELDS,
      filter: {
        id: {
          eq: AUDIT_LOG_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.auditLog).toBeNull();
  });

  it('7. should find many deleted auditLogs with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'auditLog',
      objectMetadataPluralName: 'auditLogs',
      gqlFields: AUDIT_LOG_GQL_FIELDS,
      filter: {
        id: {
          in: [AUDIT_LOG_1_ID, AUDIT_LOG_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.auditLogs.edges).toHaveLength(2);
  });

  it('7b. should find one deleted auditLog with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'auditLog',
      gqlFields: AUDIT_LOG_GQL_FIELDS,
      filter: {
        id: {
          eq: AUDIT_LOG_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.auditLog.id).toEqual(AUDIT_LOG_3_ID);
  });

  it('8. should destroy many auditLogs', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'auditLog',
      objectMetadataPluralName: 'auditLogs',
      gqlFields: AUDIT_LOG_GQL_FIELDS,
      filter: {
        id: {
          in: [AUDIT_LOG_1_ID, AUDIT_LOG_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyAuditLogs).toHaveLength(2);
  });

  it('8b. should destroy one auditLog', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'auditLog',
      gqlFields: AUDIT_LOG_GQL_FIELDS,
      recordId: AUDIT_LOG_3_ID,
    });

    const destroyAuditLogResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(destroyAuditLogResponse.body.data.destroyAuditLog).toBeTruthy();
  });

  it('9. should not find many auditLogs anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'auditLog',
      objectMetadataPluralName: 'auditLogs',
      gqlFields: AUDIT_LOG_GQL_FIELDS,
      filter: {
        id: {
          in: [AUDIT_LOG_1_ID, AUDIT_LOG_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.auditLogs.edges).toHaveLength(0);
  });

  it('9b. should not find one auditLog anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'auditLog',
      gqlFields: AUDIT_LOG_GQL_FIELDS,
      filter: {
        id: {
          eq: AUDIT_LOG_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.auditLog).toBeNull();
  });
});
