import { type ASTNode, print } from 'graphql';
import request from 'supertest';

/* global APP_PORT, APPLE_JANE_ADMIN_ACCESS_TOKEN */

type GraphqlOperation = {
  query: ASTNode;
  variables?: Record<string, unknown>;
};

export const makeAdminPanelApiRequest = (
  graphqlOperation: GraphqlOperation,
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) => {
  const client = request(`http://localhost:${APP_PORT}`);

  return client
    .post('/admin-panel')
    .set('Authorization', `Bearer ${token}`)
    .send({
      query: print(graphqlOperation.query),
      variables: graphqlOperation.variables || {},
    })
    .expect(200);
};
