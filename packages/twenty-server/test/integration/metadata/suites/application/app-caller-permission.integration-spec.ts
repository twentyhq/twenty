import gql from 'graphql-tag';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { generateApplicationToken } from 'test/integration/metadata/suites/application/utils/generate-application-token.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const APP_CALLER_HAS_PERMISSION_FLAG = gql`
  query AppCallerHasPermissionFlag($permissionFlag: PermissionFlagType!) {
    appCallerHasPermissionFlag(permissionFlag: $permissionFlag)
  }
`;

const APP_CALLER_HAS_PERMISSION_FLAG_WITH_SUPPLIED_IDENTITY = gql`
  query AppCallerHasPermissionFlagWithSuppliedIdentity(
    $permissionFlag: PermissionFlagType!
    $userWorkspaceId: String
  ) {
    appCallerHasPermissionFlag(
      permissionFlag: $permissionFlag
      userWorkspaceId: $userWorkspaceId
    )
  }
`;

describe('application caller permission (e2e)', () => {
  let appToken: string;

  beforeAll(async () => {
    const { data } = await findManyApplications({ expectToFail: false });

    const standardApplication = data.findManyApplications.find(
      (application) =>
        application.universalIdentifier ===
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
    );

    expect(standardApplication).toBeDefined();

    const { data: tokenData } = await generateApplicationToken({
      applicationId: standardApplication!.id,
      expectToFail: false,
    });

    appToken = tokenData.generateApplicationToken.applicationAccessToken.token;
  });

  it('rejects requests that do not carry an APPLICATION_ACCESS token', async () => {
    const response = await makeMetadataAPIRequest({
      query: APP_CALLER_HAS_PERMISSION_FLAG,
      variables: { permissionFlag: 'WORKSPACE_MEMBERS' },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('APPLICATION_ACCESS');
  });

  it('answers for the caller the token was minted for', async () => {
    const response = await makeMetadataAPIRequest(
      {
        query: APP_CALLER_HAS_PERMISSION_FLAG,
        variables: { permissionFlag: 'WORKSPACE_MEMBERS' },
      },
      appToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.appCallerHasPermissionFlag).toBe(true);
  });

  it('does not let the application name the identity it asks about', async () => {
    const response = await makeMetadataAPIRequest(
      {
        query: APP_CALLER_HAS_PERMISSION_FLAG_WITH_SUPPLIED_IDENTITY,
        variables: {
          permissionFlag: 'WORKSPACE_MEMBERS',
          userWorkspaceId: '00000000-0000-0000-0000-000000000000',
        },
      },
      appToken,
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('userWorkspaceId');
  });
});
