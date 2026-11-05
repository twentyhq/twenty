import { isDefined } from 'twenty-shared/utils';

import { type McpServerTool } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.type';

export const isDestructiveMcpServerTool = ({
  annotations,
}: Pick<McpServerTool, 'annotations'>): boolean => {
  if (!isDefined(annotations) || annotations.readOnlyHint) {
    return false;
  }

  return annotations.destructiveHint ?? false;
};
