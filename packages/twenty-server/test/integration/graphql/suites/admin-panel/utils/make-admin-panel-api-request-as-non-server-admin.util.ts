import { type ASTNode, print } from 'graphql';
import request from 'supertest';
import { getAccessTokenForCredentials } from 'test/integration/graphql/utils/get-access-token-for-credentials.util';

/* global APP_PORT */

type GraphqlOperation = {
  query: ASTNode;
  variables?: Record<string, unknown>;
};

// Scott is the only seeded user without canAccessFullAdminPanel or canImpersonate.
export const getNonServerAdminAccessToken = () =>
  getAccessTokenForCredentials({ email: 'scott.forstall@apple.dev' });

export const makeAdminPanelApiRequestAsNonServerAdmin = async (
  graphqlOperation: GraphqlOperation,
) => {
  const accessToken = await getNonServerAdminAccessToken();

  return request(`http://localhost:${APP_PORT}`)
    .post('/admin-panel')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      query: print(graphqlOperation.query),
      variables: graphqlOperation.variables || {},
    })
    .expect(200);
};
