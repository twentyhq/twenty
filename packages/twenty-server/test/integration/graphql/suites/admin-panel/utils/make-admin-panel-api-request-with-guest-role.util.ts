import { type ASTNode, print } from 'graphql';
import request from 'supertest';

/* global APP_PORT, APPLE_PHIL_GUEST_ACCESS_TOKEN */

type GraphqlOperation = {
  query: ASTNode;
  variables?: Record<string, unknown>;
};

// Hits the admin GraphQL schema (/admin-panel) with a guest user that lacks the
// SECURITY permission flag, so it can assert the resolver-level guards reject it.
export const makeAdminPanelAPIRequestWithGuestRole = (
  graphqlOperation: GraphqlOperation,
) => {
  const client = request(`http://localhost:${APP_PORT}`);

  return client
    .post('/admin-panel')
    .set('Authorization', `Bearer ${APPLE_PHIL_GUEST_ACCESS_TOKEN}`)
    .send({
      query: print(graphqlOperation.query),
      variables: graphqlOperation.variables || {},
    })
    .expect(200);
};
