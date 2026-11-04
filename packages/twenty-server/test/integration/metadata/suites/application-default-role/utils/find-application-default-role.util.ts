import gql from 'graphql-tag';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { type FindOneApplicationFactoryInput } from 'test/integration/metadata/suites/application/utils/find-one-application-query-factory.util';
import { findRoles } from 'test/integration/metadata/suites/role/utils/find-roles.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

const APPLICATION_DEFAULT_ROLE_GQL_FIELDS = `
  id
  label
  universalIdentifier
  applicationId
  isEditable
  canUpdateAllSettings
  canAccessAllTools
  canAccessAllAgentChatChannels
  canReadAllObjectRecords
  canUpdateAllObjectRecords
  canSoftDeleteAllObjectRecords
  canDestroyAllObjectRecords
  canBeAssignedToUsers
  canBeAssignedToAgents
  canBeAssignedToApiKeys
`;

export const findWorkspaceCustomApplicationId = async (
  token?: string,
): Promise<string> => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        query CurrentWorkspaceCustomApplication {
          currentUser {
            currentWorkspace {
              workspaceCustomApplication {
                id
              }
            }
          }
        }
      `,
    },
    token,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.currentUser.currentWorkspace
    .workspaceCustomApplication.id;
};

export const findApplicationDefaultRole = async ({
  input,
  gqlFields = APPLICATION_DEFAULT_ROLE_GQL_FIELDS,
  token,
}: {
  input: FindOneApplicationFactoryInput;
  gqlFields?: string;
  token?: string;
}) => {
  const { data: applicationData } = await findOneApplication({
    input,
    gqlFields: 'id defaultRoleId',
    expectToFail: false,
    token,
  });
  const { data: rolesData } = await findRoles({
    gqlFields,
    expectToFail: false,
    token,
  });

  return rolesData.getRoles.find(
    ({ id }) => id === applicationData.findOneApplication.defaultRoleId,
  );
};
