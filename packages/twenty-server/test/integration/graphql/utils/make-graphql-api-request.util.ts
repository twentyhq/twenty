import { type ASTNode, print } from 'graphql';
import request from 'supertest';
import { isDefined } from 'twenty-shared/utils';

type GraphqlOperation = {
  query: ASTNode;
  variables?: Record<string, unknown>;
};

export const makeGraphqlAPIRequest = (
  graphqlOperation: GraphqlOperation,
  token: string | undefined = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) => {
  const client = request(`http://localhost:${APP_PORT}`);

  const clientInstance = client.post('/graphql');

  if (isDefined(token)) {
    clientInstance.set('Authorization', `Bearer ${token}`);
  }

  return clientInstance.send({
    query: print(graphqlOperation.query),
    variables: graphqlOperation.variables || {},
  });
};
