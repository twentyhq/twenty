import { TIM_USER_ID } from 'test/integration/graphql/integration.constants';
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

const WORKSPACE_MEMBER_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const WORKSPACE_MEMBER_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const WORKSPACE_MEMBER_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';

const WORKSPACE_MEMBER_GQL_FIELDS = `
  id
  colorScheme
  avatarUrl
  locale
  timeZone
  dateFormat
  timeFormat
  userEmail
  userId
  createdAt
  updatedAt
  deletedAt
`;

describe('workspaceMembers resolvers (integration)', () => {
  it('1. should create and return workspaceMembers', async () => {
    const workspaceMemberEmail1 = generateRecordName(WORKSPACE_MEMBER_1_ID);
    const workspaceMemberEmail2 = generateRecordName(WORKSPACE_MEMBER_2_ID);

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      objectMetadataPluralName: 'workspaceMembers',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      data: [
        {
          id: WORKSPACE_MEMBER_1_ID,
          userEmail: workspaceMemberEmail1,
          userId: TIM_USER_ID,
        },
        {
          id: WORKSPACE_MEMBER_2_ID,
          userEmail: workspaceMemberEmail2,
          userId: TIM_USER_ID,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createWorkspaceMembers).toHaveLength(2);

    response.body.data.createWorkspaceMembers.forEach((workspaceMember) => {
      expect(workspaceMember).toHaveProperty('userEmail');
      expect([workspaceMemberEmail1, workspaceMemberEmail2]).toContain(
        workspaceMember.userEmail,
      );
      expect(workspaceMember).toHaveProperty('id');
      expect(workspaceMember).toHaveProperty('colorScheme');
      expect(workspaceMember).toHaveProperty('avatarUrl');
      expect(workspaceMember).toHaveProperty('locale');
      expect(workspaceMember).toHaveProperty('timeZone');
      expect(workspaceMember).toHaveProperty('dateFormat');
      expect(workspaceMember).toHaveProperty('timeFormat');
      expect(workspaceMember).toHaveProperty('userId');
      expect(workspaceMember).toHaveProperty('createdAt');
      expect(workspaceMember).toHaveProperty('updatedAt');
      expect(workspaceMember).toHaveProperty('deletedAt');
    });
  });

  it('1b. should create and return one workspaceMember', async () => {
    const workspaceMemberEmail = generateRecordName(WORKSPACE_MEMBER_3_ID);

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      data: {
        id: WORKSPACE_MEMBER_3_ID,
        userEmail: workspaceMemberEmail,
        userId: TIM_USER_ID,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdWorkspaceMember = response.body.data.createWorkspaceMember;

    expect(createdWorkspaceMember).toHaveProperty('userEmail');
    expect(createdWorkspaceMember.userEmail).toEqual(workspaceMemberEmail);
    expect(createdWorkspaceMember).toHaveProperty('id');
    expect(createdWorkspaceMember).toHaveProperty('colorScheme');
    expect(createdWorkspaceMember).toHaveProperty('avatarUrl');
    expect(createdWorkspaceMember).toHaveProperty('locale');
    expect(createdWorkspaceMember).toHaveProperty('timeZone');
    expect(createdWorkspaceMember).toHaveProperty('dateFormat');
    expect(createdWorkspaceMember).toHaveProperty('timeFormat');
    expect(createdWorkspaceMember).toHaveProperty('userId');
    expect(createdWorkspaceMember).toHaveProperty('createdAt');
    expect(createdWorkspaceMember).toHaveProperty('updatedAt');
    expect(createdWorkspaceMember).toHaveProperty('deletedAt');
  });

  it('2. should find many workspaceMembers', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      objectMetadataPluralName: 'workspaceMembers',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.workspaceMembers;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    if (data.edges.length > 0) {
      const workspaceMembers = data.edges[0].node;

      expect(workspaceMembers).toHaveProperty('id');
      expect(workspaceMembers).toHaveProperty('colorScheme');
      expect(workspaceMembers).toHaveProperty('avatarUrl');
      expect(workspaceMembers).toHaveProperty('locale');
      expect(workspaceMembers).toHaveProperty('timeZone');
      expect(workspaceMembers).toHaveProperty('dateFormat');
      expect(workspaceMembers).toHaveProperty('timeFormat');
      expect(workspaceMembers).toHaveProperty('userEmail');
      expect(workspaceMembers).toHaveProperty('userId');
      expect(workspaceMembers).toHaveProperty('createdAt');
      expect(workspaceMembers).toHaveProperty('updatedAt');
      expect(workspaceMembers).toHaveProperty('deletedAt');
    }
  });

  it('2b. should find one workspaceMember', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      filter: {
        id: {
          eq: WORKSPACE_MEMBER_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const workspaceMember = response.body.data.workspaceMember;

    expect(workspaceMember).toHaveProperty('id');
    expect(workspaceMember).toHaveProperty('colorScheme');
    expect(workspaceMember).toHaveProperty('avatarUrl');
    expect(workspaceMember).toHaveProperty('locale');
    expect(workspaceMember).toHaveProperty('timeZone');
    expect(workspaceMember).toHaveProperty('dateFormat');
    expect(workspaceMember).toHaveProperty('timeFormat');
    expect(workspaceMember).toHaveProperty('userEmail');
    expect(workspaceMember).toHaveProperty('userId');
    expect(workspaceMember).toHaveProperty('createdAt');
    expect(workspaceMember).toHaveProperty('updatedAt');
    expect(workspaceMember).toHaveProperty('deletedAt');
  });

  it('3. should update many workspaceMembers', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      objectMetadataPluralName: 'workspaceMembers',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      data: {
        locale: 'en-US',
      },
      filter: {
        id: {
          in: [WORKSPACE_MEMBER_1_ID, WORKSPACE_MEMBER_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedWorkspaceMembers = response.body.data.updateWorkspaceMembers;

    expect(updatedWorkspaceMembers).toHaveLength(2);

    updatedWorkspaceMembers.forEach((workspaceMember) => {
      expect(workspaceMember.locale).toEqual('en-US');
    });
  });

  it('3b. should update one workspaceMember', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      data: {
        locale: 'fr-CA',
      },
      recordId: WORKSPACE_MEMBER_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedWorkspaceMember = response.body.data.updateWorkspaceMember;

    expect(updatedWorkspaceMember.locale).toEqual('fr-CA');
  });

  it('4. should find many workspaceMembers with updated locale', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      objectMetadataPluralName: 'workspaceMembers',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      filter: {
        locale: {
          eq: 'en-US',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.workspaceMembers.edges).toHaveLength(2);
  });

  it('4b. should find one workspaceMember with updated locale', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      filter: {
        locale: {
          eq: 'fr-CA',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.workspaceMember.locale).toEqual('fr-CA');
  });

  it('5. should not delete many workspaceMembers', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      objectMetadataPluralName: 'workspaceMembers',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      filter: {
        id: {
          in: [WORKSPACE_MEMBER_1_ID, WORKSPACE_MEMBER_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteWorkspaceMembers).toBeNull();
    expect(response.body.errors).toStrictEqual([
      {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
        message: 'Method not allowed.',
      },
    ]);
  });

  it('5b. should delete one workspaceMember', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      recordId: WORKSPACE_MEMBER_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteWorkspaceMember.deletedAt).toBeTruthy();
  });

  it('6. should still find many workspaceMembers that were not deleted', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      objectMetadataPluralName: 'workspaceMembers',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      filter: {
        id: {
          in: [WORKSPACE_MEMBER_1_ID, WORKSPACE_MEMBER_2_ID],
        },
      },
    });

    const findWorkspaceMembersResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      findWorkspaceMembersResponse.body.data.workspaceMembers.edges,
    ).toHaveLength(2);
  });

  it('6b. should not find one workspaceMember anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      filter: {
        id: {
          eq: WORKSPACE_MEMBER_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.workspaceMember).toBeNull();
  });

  it('7. should not find many deleted workspaceMembers with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      objectMetadataPluralName: 'workspaceMembers',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      filter: {
        id: {
          in: [WORKSPACE_MEMBER_1_ID, WORKSPACE_MEMBER_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.workspaceMembers.edges).toHaveLength(0);
  });

  it('7b. should find one deleted workspaceMember with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      filter: {
        id: {
          eq: WORKSPACE_MEMBER_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.workspaceMember.id).toEqual(
      WORKSPACE_MEMBER_3_ID,
    );
  });

  it('8. should destroy many workspaceMembers', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      objectMetadataPluralName: 'workspaceMembers',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      filter: {
        id: {
          in: [WORKSPACE_MEMBER_1_ID, WORKSPACE_MEMBER_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyWorkspaceMembers).toHaveLength(2);
  });

  it('8b. should destroy one workspaceMember', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      recordId: WORKSPACE_MEMBER_3_ID,
    });

    const destroyWorkspaceMemberResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      destroyWorkspaceMemberResponse.body.data.destroyWorkspaceMember,
    ).toBeTruthy();
  });

  it('9. should not find many workspaceMembers anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      objectMetadataPluralName: 'workspaceMembers',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      filter: {
        id: {
          in: [WORKSPACE_MEMBER_1_ID, WORKSPACE_MEMBER_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.workspaceMembers.edges).toHaveLength(0);
  });

  it('9b. should not find one workspaceMember anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      filter: {
        id: {
          eq: WORKSPACE_MEMBER_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.workspaceMember).toBeNull();
  });
});
