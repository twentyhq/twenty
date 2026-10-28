import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

const MCP_SERVER_REFERENCE_REGEX =
  /\[\[mcpServer:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}):/g;

export const collectReferencedMcpServerIds = (
  messages: Pick<ExtendedUIMessage, 'role' | 'parts'>[],
): string[] => {
  const mcpServerIds = new Set<string>();

  for (const message of messages) {
    if (message.role !== 'user' || !isDefined(message.parts)) {
      continue;
    }

    for (const part of message.parts) {
      if (part.type !== 'text') {
        continue;
      }

      for (const match of part.text.matchAll(MCP_SERVER_REFERENCE_REGEX)) {
        mcpServerIds.add(match[1]);
      }
    }
  }

  return [...mcpServerIds];
};
