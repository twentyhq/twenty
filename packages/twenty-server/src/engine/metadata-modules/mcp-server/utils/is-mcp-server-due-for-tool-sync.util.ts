import { isDefined } from 'twenty-shared/utils';

import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';

const FAILED_TOOL_SYNC_RETRY_INTERVAL_MS = 5 * 60 * 1000;

export const isMcpServerDueForToolSync = ({
  mcpServer,
  now,
}: {
  mcpServer: Pick<
    FlatMcpServer,
    'toolsSyncedAt' | 'toolsSyncError' | 'updatedAt'
  >;
  now: Date;
}): boolean => {
  if (isDefined(mcpServer.toolsSyncedAt)) {
    return false;
  }

  if (!isDefined(mcpServer.toolsSyncError)) {
    return true;
  }

  return (
    now.getTime() - new Date(mcpServer.updatedAt).getTime() >
    FAILED_TOOL_SYNC_RETRY_INTERVAL_MS
  );
};
