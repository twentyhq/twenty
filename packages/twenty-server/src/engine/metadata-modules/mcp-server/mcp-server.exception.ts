import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum McpServerExceptionCode {
  MCP_SERVER_NOT_FOUND = 'MCP_SERVER_NOT_FOUND',
  MCP_SERVER_NAME_ALREADY_EXISTS = 'MCP_SERVER_NAME_ALREADY_EXISTS',
  INVALID_MCP_SERVER_INPUT = 'INVALID_MCP_SERVER_INPUT',
  INVALID_MCP_SERVER_NAME = 'INVALID_MCP_SERVER_NAME',
  INVALID_MCP_SERVER_URL = 'INVALID_MCP_SERVER_URL',
  CONNECTION_PROVIDER_NOT_FOUND = 'CONNECTION_PROVIDER_NOT_FOUND',
  CONNECTION_PROVIDER_NOT_IN_APPLICATION = 'CONNECTION_PROVIDER_NOT_IN_APPLICATION',
  MCP_SERVER_URL_CHANGE_WHILE_CONNECTED = 'MCP_SERVER_URL_CHANGE_WHILE_CONNECTED',
}

const getMcpServerExceptionUserFriendlyMessage = (
  code: McpServerExceptionCode,
) => {
  switch (code) {
    case McpServerExceptionCode.MCP_SERVER_NOT_FOUND:
      return msg`MCP server not found.`;
    case McpServerExceptionCode.MCP_SERVER_NAME_ALREADY_EXISTS:
      return msg`An MCP server with this name already exists.`;
    case McpServerExceptionCode.INVALID_MCP_SERVER_INPUT:
      return msg`Invalid MCP server input.`;
    case McpServerExceptionCode.INVALID_MCP_SERVER_NAME:
      return msg`Invalid MCP server name. Use lowercase letters, digits and underscores, starting with a letter.`;
    case McpServerExceptionCode.INVALID_MCP_SERVER_URL:
      return msg`Invalid MCP server URL. Please provide a valid HTTP or HTTPS URL.`;
    case McpServerExceptionCode.CONNECTION_PROVIDER_NOT_FOUND:
      return msg`Connection provider not found.`;
    case McpServerExceptionCode.CONNECTION_PROVIDER_NOT_IN_APPLICATION:
      return msg`The connection provider must belong to the same application as the MCP server.`;
    case McpServerExceptionCode.MCP_SERVER_URL_CHANGE_WHILE_CONNECTED:
      return msg`Disconnect the MCP server before changing its URL.`;
    default:
      assertUnreachable(code);
  }
};

export class McpServerException extends CustomException<McpServerExceptionCode> {
  constructor(
    message: string,
    code: McpServerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getMcpServerExceptionUserFriendlyMessage(code),
    });
  }
}
