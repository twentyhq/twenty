import { type ASTNode, print } from 'graphql';
import request from 'supertest';

/* global APP_PORT, APPLE_JANE_ADMIN_ACCESS_TOKEN */

type GraphqlOperation = {
  query: ASTNode;
  variables?: Record<string, unknown>;
};

export const makeAdminPanelAPIRequest = (
  graphqlOperation: GraphqlOperation,
) => {
  const client = request(`http://localhost:${APP_PORT}`);

  return client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: print(graphqlOperation.query),
      variables: graphqlOperation.variables || {},
    })
    .expect(200);
};
