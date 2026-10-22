import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { MCP_SERVER_TOOL_DESCRIPTION_MAX_LENGTH } from 'src/engine/metadata-modules/mcp-server/constants/mcp-server-tool-description-max-length.constant';
import { MCP_TOOL_NAME_PATTERN } from 'src/engine/metadata-modules/mcp-server/constants/mcp-tool-name-pattern.constant';
import { type McpServerTool } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.type';
import { buildMcpToolName } from 'src/engine/metadata-modules/mcp-server/utils/build-mcp-tool-name.util';

export type RemoteMcpTool = {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
  annotations?: Record<string, unknown>;
};

type SanitizeMcpServerToolsResult = {
  tools: McpServerTool[];
  skippedToolNames: string[];
};

// Tabs and newlines keep multi-line descriptions readable; every other control character goes
// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTERS_PATTERN =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export const sanitizeMcpToolDescription = (
  description: string | undefined,
): string | null => {
  if (!isNonEmptyString(description)) {
    return null;
  }

  const stripped = description.replace(CONTROL_CHARACTERS_PATTERN, '').trim();

  if (stripped.length === 0) {
    return null;
  }

  return stripped.length > MCP_SERVER_TOOL_DESCRIPTION_MAX_LENGTH
    ? `${stripped.slice(0, MCP_SERVER_TOOL_DESCRIPTION_MAX_LENGTH)}…`
    : stripped;
};

export const sanitizeMcpServerTools = ({
  remoteTools,
  mcpServerName,
}: {
  remoteTools: RemoteMcpTool[];
  mcpServerName: string;
}): SanitizeMcpServerToolsResult => {
  const tools: McpServerTool[] = [];
  const skippedToolNames: string[] = [];
  const seenToolNames = new Set<string>();

  for (const remoteTool of remoteTools) {
    const isNameValid = MCP_TOOL_NAME_PATTERN.test(
      buildMcpToolName({ mcpServerName, toolName: remoteTool.name }),
    );

    if (!isNameValid || seenToolNames.has(remoteTool.name)) {
      skippedToolNames.push(remoteTool.name);
      continue;
    }

    seenToolNames.add(remoteTool.name);

    tools.push({
      name: remoteTool.name,
      description: sanitizeMcpToolDescription(remoteTool.description),
      inputSchema: isPlainObject(remoteTool.inputSchema)
        ? remoteTool.inputSchema
        : { type: 'object', properties: {} },
      annotations: isPlainObject(remoteTool.annotations)
        ? remoteTool.annotations
        : null,
    });
  }

  return { tools, skippedToolNames };
};
