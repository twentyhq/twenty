import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';

export const mcpServerGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof McpServerException) {
    switch (error.code) {
      case McpServerExceptionCode.MCP_SERVER_NOT_FOUND:
        throw new NotFoundError(error);
      case McpServerExceptionCode.INVALID_MCP_SERVER_INPUT:
      case McpServerExceptionCode.INVALID_MCP_SERVER_NAME:
      case McpServerExceptionCode.INVALID_MCP_SERVER_URL:
      case McpServerExceptionCode.CONNECTION_PROVIDER_NOT_FOUND:
      case McpServerExceptionCode.CONNECTION_PROVIDER_NOT_IN_APPLICATION:
      case McpServerExceptionCode.MCP_SERVER_URL_CHANGE_WHILE_CONNECTED:
        throw new UserInputError(error);
      case McpServerExceptionCode.MCP_SERVER_NAME_ALREADY_EXISTS:
        throw new ConflictError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
