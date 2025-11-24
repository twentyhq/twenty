import { type ASTNode, print } from 'graphql';
import request from 'supertest';

type GraphqlOperation = {
  query: ASTNode;
  variables?: Record<string, unknown>;
};

export const makeMetadataAPIRequest = (
  graphqlOperation: GraphqlOperation,
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) => {
  const client = request(`http://localhost:${APP_PORT}`);

  return client
    .post('/metadata')
    .set('Authorization', `Bearer ${token}`)
    .send({
      query: print(graphqlOperation.query),
      variables: graphqlOperation.variables || {},
    });
};
