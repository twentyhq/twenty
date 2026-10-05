import gql from 'graphql-tag';
import request from 'supertest';
import {
  MessageChannelVisibility,
  MessageParticipantRole,
} from 'twenty-shared/types';

export type ApplicationOnlyEndpointTarget = {
  connectedAccountId: string;
  messageChannelId: string;
  keyValueKey: string;
  logicFunctionUniversalIdentifier: string;
  jobId: string;
};

export const APPLICATION_ONLY_GRAPHQL_OPERATION_FACTORIES = {
  appConnections: () => ({
    query: gql`
      query AppConnections {
        appConnections {
          id
        }
      }
    `,
  }),
  appConnection: ({
    connectedAccountId,
  }: Pick<ApplicationOnlyEndpointTarget, 'connectedAccountId'>) => ({
    query: gql`
      query AppConnection($id: ID!) {
        appConnection(id: $id) {
          id
        }
      }
    `,
    variables: { id: connectedAccountId },
  }),
  reportAppConnectionAuthFailure: ({
    connectedAccountId,
  }: Pick<ApplicationOnlyEndpointTarget, 'connectedAccountId'>) => ({
    query: gql`
      mutation ReportAppConnectionAuthFailure(
        $input: ReportAppConnectionAuthFailureInput!
      ) {
        reportAppConnectionAuthFailure(input: $input)
      }
    `,
    variables: {
      input: { id: connectedAccountId, reason: 'application-only-probe' },
    },
  }),
  appKeyValue: ({
    keyValueKey,
  }: Pick<ApplicationOnlyEndpointTarget, 'keyValueKey'>) => ({
    query: gql`
      query AppKeyValue($key: String!) {
        appKeyValue(key: $key) {
          key
        }
      }
    `,
    variables: { key: keyValueKey },
  }),
  setAppKeyValue: ({
    keyValueKey,
  }: Pick<ApplicationOnlyEndpointTarget, 'keyValueKey'>) => ({
    query: gql`
      mutation SetAppKeyValue($input: SetAppKeyValueInput!) {
        setAppKeyValue(input: $input) {
          key
        }
      }
    `,
    variables: {
      input: { key: keyValueKey, value: 'application-only-probe' },
    },
  }),
  deleteAppKeyValue: ({
    keyValueKey,
  }: Pick<ApplicationOnlyEndpointTarget, 'keyValueKey'>) => ({
    query: gql`
      mutation DeleteAppKeyValue($key: String!) {
        deleteAppKeyValue(key: $key)
      }
    `,
    variables: { key: keyValueKey },
  }),
  enqueueJob: ({
    logicFunctionUniversalIdentifier,
    jobId,
  }: Pick<
    ApplicationOnlyEndpointTarget,
    'logicFunctionUniversalIdentifier' | 'jobId'
  >) => ({
    query: gql`
      mutation EnqueueJob($input: EnqueueJobInput!) {
        enqueueJob(input: $input) {
          jobId
        }
      }
    `,
    variables: { input: { logicFunctionUniversalIdentifier, jobId } },
  }),
  enqueueJobs: ({
    logicFunctionUniversalIdentifier,
    jobId,
  }: Pick<
    ApplicationOnlyEndpointTarget,
    'logicFunctionUniversalIdentifier' | 'jobId'
  >) => ({
    query: gql`
      mutation EnqueueJobs($input: EnqueueJobsInput!) {
        enqueueJobs(input: $input) {
          jobIds
        }
      }
    `,
    variables: {
      input: {
        logicFunctionUniversalIdentifier,
        jobs: [{ jobId, payload: {} }],
      },
    },
  }),
  getJobs: ({ jobId }: Pick<ApplicationOnlyEndpointTarget, 'jobId'>) => ({
    query: gql`
      query GetJobs($jobIds: [String!]!) {
        getJobs(jobIds: $jobIds) {
          jobId
        }
      }
    `,
    variables: { jobIds: [jobId] },
  }),
  appMessageChannels: () => ({
    query: gql`
      query AppMessageChannels {
        appMessageChannels {
          id
        }
      }
    `,
  }),
  createAppMessageChannel: ({
    connectedAccountId,
  }: Pick<ApplicationOnlyEndpointTarget, 'connectedAccountId'>) => ({
    query: gql`
      mutation CreateAppMessageChannel($input: CreateAppMessageChannelInput!) {
        createAppMessageChannel(input: $input) {
          id
        }
      }
    `,
    variables: {
      input: {
        connectedAccountId,
        handle: 'application-only-probe@slack.test',
        visibility: MessageChannelVisibility.SHARE_EVERYTHING,
      },
    },
  }),
  updateAppMessageChannel: ({
    messageChannelId,
  }: Pick<ApplicationOnlyEndpointTarget, 'messageChannelId'>) => ({
    query: gql`
      mutation UpdateAppMessageChannel($input: UpdateAppMessageChannelInput!) {
        updateAppMessageChannel(input: $input) {
          id
        }
      }
    `,
    variables: {
      input: { id: messageChannelId, displayName: 'application-only-probe' },
    },
  }),
  deleteAppMessageChannel: ({
    messageChannelId,
  }: Pick<ApplicationOnlyEndpointTarget, 'messageChannelId'>) => ({
    query: gql`
      mutation DeleteAppMessageChannel($id: UUID!) {
        deleteAppMessageChannel(id: $id) {
          id
        }
      }
    `,
    variables: { id: messageChannelId },
  }),
  ingestAppMessages: ({
    messageChannelId,
  }: Pick<ApplicationOnlyEndpointTarget, 'messageChannelId'>) => ({
    query: gql`
      mutation IngestAppMessages($input: IngestAppMessagesInput!) {
        ingestAppMessages(input: $input) {
          messages {
            messageId
          }
        }
      }
    `,
    variables: {
      input: {
        messageChannelId,
        messages: [
          {
            externalId: 'application-only-probe',
            threadExternalId: 'application-only-probe',
            text: 'application-only-probe',
            receivedAt: '2026-01-01T10:00:00.000Z',
            participants: [
              {
                role: MessageParticipantRole.FROM,
                handle: 'sender@slack.test',
              },
            ],
          },
        ],
      },
    },
  }),
};

type ApplicationOnlyRestRequest = {
  method: 'get' | 'post';
  path: string;
  body?: Record<string, unknown>;
};

export const APPLICATION_ONLY_REST_REQUEST_FACTORIES = {
  'POST /apps/connections/list': (): ApplicationOnlyRestRequest => ({
    method: 'post',
    path: '/apps/connections/list',
    body: {},
  }),
  'POST /apps/connections/get': ({
    connectedAccountId,
  }: Pick<
    ApplicationOnlyEndpointTarget,
    'connectedAccountId'
  >): ApplicationOnlyRestRequest => ({
    method: 'post',
    path: '/apps/connections/get',
    body: { id: connectedAccountId },
  }),
  'GET /app/billing/credits': (): ApplicationOnlyRestRequest => ({
    method: 'get',
    path: '/app/billing/credits',
  }),
  'POST /app/billing/charge': (): ApplicationOnlyRestRequest => ({
    method: 'post',
    path: '/app/billing/charge',
    body: { creditsUsedMicro: 0, quantity: 1, operationType: 'AI_CHAT_TOKEN' },
  }),
};

export const makeApplicationOnlyRestRequest = (
  { method, path, body }: ApplicationOnlyRestRequest,
  token: string,
) => {
  const client = request(`http://localhost:${APP_PORT}`);
  const authorization = `Bearer ${token}`;

  return method === 'get'
    ? client.get(path).set('Authorization', authorization)
    : client.post(path).set('Authorization', authorization).send(body);
};
