import { gql } from 'graphql-tag';

import { makeMetadataApiRequest } from './make-metadata-api-request.util';

const MCP_SERVER_FIELDS = `
  id
  name
  label
  url
  connectionProviderId
  isActive
  applicationId
`;

const CREATE_MCP_SERVER_MUTATION = gql`
  mutation CreateMcpServer($input: CreateMcpServerInput!) {
    createMcpServer(input: $input) {
      ${MCP_SERVER_FIELDS}
    }
  }
`;

const UPDATE_MCP_SERVER_MUTATION = gql`
  mutation UpdateMcpServer($input: UpdateMcpServerInput!) {
    updateMcpServer(input: $input) {
      ${MCP_SERVER_FIELDS}
    }
  }
`;

const DELETE_MCP_SERVER_MUTATION = gql`
  mutation DeleteMcpServer($id: UUID!) {
    deleteMcpServer(id: $id) {
      ${MCP_SERVER_FIELDS}
    }
  }
`;

const GET_MCP_SERVER_QUERY = gql`
  query GetMcpServer($id: UUID!) {
    mcpServer(id: $id) {
      ${MCP_SERVER_FIELDS}
    }
  }
`;

export type McpServerInput = {
  name: string;
  label: string;
  url: string;
  connectionProviderId?: string | null;
  isActive?: boolean;
};

export const createMcpServer = (input: McpServerInput) =>
  makeMetadataApiRequest({
    query: CREATE_MCP_SERVER_MUTATION,
    variables: { input },
  });

export const updateMcpServer = ({
  id,
  update,
}: {
  id: string;
  update: Partial<McpServerInput>;
}) =>
  makeMetadataApiRequest({
    query: UPDATE_MCP_SERVER_MUTATION,
    variables: { input: { id, update } },
  });

export const deleteMcpServer = (id: string) =>
  makeMetadataApiRequest({
    query: DELETE_MCP_SERVER_MUTATION,
    variables: { id },
  });

export const getMcpServer = (id: string) =>
  makeMetadataApiRequest({
    query: GET_MCP_SERVER_QUERY,
    variables: { id },
  });
