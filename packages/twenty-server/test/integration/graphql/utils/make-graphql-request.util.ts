import { TypedDocumentNode } from '@apollo/client';
import { ASTNode, print } from 'graphql';
import request from 'supertest';
import {
  CreateOneRoleMutation,
  CreateOneRoleMutationVariables,
  CreateWorkflowVersionStepDocument,
  CreateWorkflowVersionStepMutation,
  CreateWorkflowVersionStepMutationVariables,
  UpdateOneRoleDocument,
} from 'test/generated/graphql';
import { CommonResponseBody } from 'test/integration/graphql/types/common-response-body.type';

type GraphqlOperation = {
  query: ASTNode;
  variables?: Record<string, unknown>;
};

export const TESTING_MOCK_ACCESS_TOKEN = {
  ADMIN: ADMIN_ACCESS_TOKEN,
  EXPIRED: EXPIRED_ACCESS_TOKEN,
  INVALID: INVALID_ACCESS_TOKEN,
  MEMBER: MEMBER_ACCESS_TOKEN,
  GUEST: GUEST_ACCESS_TOKEN,
  API_KEY: API_KEY_ACCESS_TOKEN,
} as const;

type TestingMockAccessTokenKeys = keyof typeof TESTING_MOCK_ACCESS_TOKEN;

export type MakeGraphqlRequestOptions = {
  unauthenticated?: boolean;
  authenticationToken?: string;
  testingToken?: TestingMockAccessTokenKeys;
};

type ApiPath = 'metadata' | 'graphql';

export type GraphqlOperationWithOptions = {
  operation: GraphqlOperation;
  options?: MakeGraphqlRequestOptions;
};

export const makeGraphqlRequest = async <
  TData = unknown,
  TVariables = Record<string, unknown>,
>(
  path: ApiPath,
  document: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
  options?: {
    authenticationToken?: string;
    testingToken?: TestingMockAccessTokenKeys;
    unauthenticated?: boolean;
  },
): CommonResponseBody<TData> => {
  const {
    authenticationToken,
    testingToken,
    unauthenticated,
  }: MakeGraphqlRequestOptions = {
    unauthenticated: false,
    testingToken: 'ADMIN',
    ...options,
  };

  const client = request(`http://localhost:${APP_PORT}`).post(`/${path}`);

  if (!unauthenticated) {
    const token = TESTING_MOCK_ACCESS_TOKEN[testingToken];

    client.set('Authorization', `Bearer ${authenticationToken ?? token}`);
  }

  const response = await client.send({
    query: print(document),
    variables: variables || {},
  });

  return {
    data: response.body.data,
    errors: response.body.errors,
    rawResponse: response,
  };
};

const tmp = async () => {
  const coucou = await makeGraphqlRequest<
    CreateOneRoleMutation,
    CreateOneRoleMutationVariables
  >('graphql', UpdateOneRoleDocument, {
    createRoleInput: {
      label: 'test',
    },
  });

  const workflows = await makeGraphqlRequest<
    CreateWorkflowVersionStepMutation,
    CreateWorkflowVersionStepMutationVariables
  >('graphql', CreateWorkflowVersionStepDocument, {
    input: { stepType: 'to', workflowVersionId: '' },
  });
};
