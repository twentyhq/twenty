import { type ConnectionProviderScope } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';

export const validateMcpServerSignInInputOrThrow = ({
  connectionProviderId,
  signInScope,
}: {
  connectionProviderId?: string | null;
  signInScope?: ConnectionProviderScope | null;
}): void => {
  if (isDefined(connectionProviderId) && isDefined(signInScope)) {
    throw new McpServerException(
      'signInScope only applies to the sign-in Twenty sets up; it cannot be combined with connectionProviderId',
      McpServerExceptionCode.INVALID_MCP_SERVER_INPUT,
    );
  }
};
