import { type ASTNode, print } from 'graphql';
import request from 'supertest';
import { isDefined } from 'twenty-shared/utils';

type GraphqlOperation = {
  query: ASTNode;
  variables?: Record<string, unknown>;
};

// Pass null for an unauthenticated request: undefined falls back to the
// default token because parameter defaults apply to undefined, not null.
export const makeMetadataAPIRequest = (
  graphqlOperation: GraphqlOperation,
  token: string | null | undefined = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) => {
  const client = request(`http://localhost:${APP_PORT}`);

  const clientInstance = client.post('/metadata');

  if (isDefined(token)) {
    clientInstance.set('Authorization', `Bearer ${token}`);
  }

  return clientInstance.send({
    query: print(graphqlOperation.query),
    variables: graphqlOperation.variables || {},
  });
};
