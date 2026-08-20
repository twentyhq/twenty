import gql from 'graphql-tag';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { generateApplicationToken } from 'test/integration/metadata/suites/application/utils/generate-application-token.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const LOGIC_FUNCTION_TRIGGERED_BY = gql`
  query LogicFunctionTriggeredBy {
    logicFunctionTriggeredBy {
      userId
      userWorkspaceId
      workspaceMemberId
      permissionFlags
    }
  }
`;

const LOGIC_FUNCTION_TRIGGERED_BY_WITH_SUPPLIED_IDENTITY = gql`
  query LogicFunctionTriggeredByWithSuppliedIdentity($userWorkspaceId: String) {
    logicFunctionTriggeredBy(userWorkspaceId: $userWorkspaceId) {
      userId
    }
  }
`;

describe('logic function triggered by (e2e)', () => {
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
      query: LOGIC_FUNCTION_TRIGGERED_BY,
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('APPLICATION_ACCESS');
  });

  it('describes the person the token was minted for', async () => {
    const response = await makeMetadataAPIRequest(
      {
        query: LOGIC_FUNCTION_TRIGGERED_BY,
      },
      appToken,
    );

    expect(response.body.errors).toBeUndefined();

    const triggeredBy = response.body.data.logicFunctionTriggeredBy;

    expect(triggeredBy.userId).toBeDefined();
    expect(triggeredBy.userWorkspaceId).toBeDefined();
    expect(triggeredBy.permissionFlags).toContain('WORKSPACE_MEMBERS');
  });

  it('does not let the application name the identity it asks about', async () => {
    const response = await makeMetadataAPIRequest(
      {
        query: LOGIC_FUNCTION_TRIGGERED_BY_WITH_SUPPLIED_IDENTITY,
        variables: {
          userWorkspaceId: '00000000-0000-0000-0000-000000000000',
        },
      },
      appToken,
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('userWorkspaceId');
  });
});
