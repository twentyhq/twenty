import {
  type ProtocolError,
  ProtocolErrorCode,
} from '@modelcontextprotocol/client';

import { isMcpUnknownToolMessage } from 'src/engine/metadata-modules/mcp-server/utils/is-mcp-unknown-tool-message.util';

export const isMcpUnknownToolError = (error: ProtocolError): boolean =>
  error.code === ProtocolErrorCode.MethodNotFound ||
  (error.code === ProtocolErrorCode.InvalidParams &&
    isMcpUnknownToolMessage(error.message));
