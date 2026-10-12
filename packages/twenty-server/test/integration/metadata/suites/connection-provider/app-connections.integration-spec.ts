import { gql } from 'graphql-tag';
import {
  APPLICATION_ONLY_REST_REQUEST_FACTORIES,
  makeApplicationOnlyRestRequest,
} from 'test/integration/metadata/suites/application/utils/application-only-endpoint-request-factories.util';
import {
  type ApplicationWithAppConnection,
  cleanupApplicationWithAppConnection,
  setupApplicationWithAppConnection,
} from 'test/integration/metadata/suites/connection-provider/utils/setup-application-with-app-connection.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { isDefined } from 'twenty-shared/utils';

import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const APP_CONNECTION_FIELDS = gql`
  fragment AppConnectionFields on AppConnection {
    id
    providerName
    handle
    visibility
    userWorkspaceId
    accessToken
  }
`;

const LIST_APP_CONNECTIONS_QUERY = gql`
  ${APP_CONNECTION_FIELDS}
  query AppConnections {
    appConnections {
      ...AppConnectionFields
    }
  }
`;

const GET_APP_CONNECTION_QUERY = gql`
  ${APP_CONNECTION_FIELDS}
  query AppConnection($id: ID!) {
    appConnection(id: $id) {
      ...AppConnectionFields
    }
  }
`;

describe('app connections API (e2e)', () => {
  let application: ApplicationWithAppConnection;

  const expectedConnection = () => ({
    id: application.connectedAccountId,
    providerName: application.connectionProviderName,
    handle: application.connectedAccountHandle,
    visibility: 'workspace',
    userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    accessToken: application.connectedAccountAccessToken,
  });

  beforeAll(async () => {
    application = await setupApplicationWithAppConnection({
      name: 'App Connections',
    });
  }, 120000);

  afterAll(async () => {
    if (isDefined(application)) {
      await cleanupApplicationWithAppConnection(application);
    }
  }, 120000);

  it('lists the connections of the calling application', async () => {
    const response = await makeMetadataApiRequest(
      { query: LIST_APP_CONNECTIONS_QUERY },
      application.applicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.appConnections).toEqual([expectedConnection()]);
  });

  it('returns one connection of the calling application', async () => {
    const response = await makeMetadataApiRequest(
      {
        query: GET_APP_CONNECTION_QUERY,
        variables: { id: application.connectedAccountId },
      },
      application.applicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.appConnection).toEqual(expectedConnection());
  });

  it('lists the connections of the calling application over the deprecated REST endpoint', async () => {
    const response = await makeApplicationOnlyRestRequest(
      APPLICATION_ONLY_REST_REQUEST_FACTORIES['POST /apps/connections/list'](),
      application.applicationToken,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      expect.objectContaining(expectedConnection()),
    ]);
  });

  it('returns one connection of the calling application over the deprecated REST endpoint', async () => {
    const response = await makeApplicationOnlyRestRequest(
      APPLICATION_ONLY_REST_REQUEST_FACTORIES['POST /apps/connections/get'](
        application,
      ),
      application.applicationToken,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining(expectedConnection()),
    );
  });
});
