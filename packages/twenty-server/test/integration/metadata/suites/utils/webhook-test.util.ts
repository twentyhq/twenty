import http from 'http';

import { gql } from 'graphql-tag';

import { makeMetadataAPIRequest } from './make-metadata-api-request.util';

const CREATE_WEBHOOK_MUTATION = gql`
  mutation CreateWebhook($input: CreateWebhookInput!) {
    createWebhook(input: $input) {
      id
      targetUrl
      operations
      description
      secret
    }
  }
`;

const DELETE_WEBHOOK_MUTATION = gql`
  mutation DeleteWebhook($id: UUID!) {
    deleteWebhook(id: $id) {
      id
      targetUrl
      operations
      description
      secret
    }
  }
`;

const GET_WEBHOOK_QUERY = gql`
  query GetWebhook($id: UUID!) {
    webhook(id: $id) {
      id
      targetUrl
      operations
      description
      secret
    }
  }
`;

const GET_WEBHOOKS_QUERY = gql`
  query GetWebhooks {
    webhooks {
      id
      targetUrl
      operations
      description
      secret
    }
  }
`;

const UPDATE_WEBHOOK_MUTATION = gql`
  mutation UpdateWebhook($input: UpdateWebhookInput!) {
    updateWebhook(input: $input) {
      id
      targetUrl
      operations
      description
      secret
    }
  }
`;

export type WebhookInput = {
  targetUrl: string;
  operations: string[];
  description?: string;
  secret?: string;
};

export type WebhookReceiver = {
  server: http.Server;
  receivedPayloads: object[];
  close: () => Promise<void>;
};

export const createWebhook = (input: WebhookInput) => {
  return makeMetadataAPIRequest({
    query: CREATE_WEBHOOK_MUTATION,
    variables: { input },
  });
};

export const deleteWebhook = (id: string) => {
  return makeMetadataAPIRequest({
    query: DELETE_WEBHOOK_MUTATION,
    variables: { id },
  });
};

export const getWebhook = (id: string) => {
  return makeMetadataAPIRequest({
    query: GET_WEBHOOK_QUERY,
    variables: { id },
  });
};

export const getWebhooks = () => {
  return makeMetadataAPIRequest({
    query: GET_WEBHOOKS_QUERY,
  });
};

export const updateWebhook = (
  input: Partial<WebhookInput> & { id: string },
) => {
  return makeMetadataAPIRequest({
    query: UPDATE_WEBHOOK_MUTATION,
    variables: { input },
  });
};

export const createWebhookReceiver = (
  port: number,
): Promise<WebhookReceiver> => {
  return new Promise((resolve) => {
    const receivedPayloads: object[] = [];

    const server = http.createServer((req, res) => {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          receivedPayloads.push(JSON.parse(body));
        } catch {
          receivedPayloads.push({ raw: body });
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      });
    });

    server.listen(port, '127.0.0.1', () => {
      resolve({
        server,
        receivedPayloads,
        close: () =>
          new Promise<void>((resolveClose) =>
            server.close(() => resolveClose()),
          ),
      });
    });
  });
};
