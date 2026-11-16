import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

type ToolOutputContentItem =
  | { type: 'text'; text: string }
  | { type: 'image' | 'audio'; mimeType: string }
  | { type: 'resource'; uri: string; text?: string }
  | { type: 'resource_link'; uri: string; name: string };

const toContentItemWithoutBinaryPayload = (
  item: CallToolResult['content'][number],
): ToolOutputContentItem => {
  switch (item.type) {
    case 'text':
      return { type: 'text', text: item.text };
    case 'image':
    case 'audio':
      return { type: item.type, mimeType: item.mimeType };
    case 'resource':
      return {
        type: 'resource',
        uri: item.resource.uri,
        ...('text' in item.resource && { text: item.resource.text }),
      };
    case 'resource_link':
      return { type: 'resource_link', uri: item.uri, name: item.name };
  }
};

export const fromCallToolResultToToolOutput = ({
  toolName,
  result,
}: {
  toolName: string;
  result: CallToolResult;
}): ToolOutput => {
  const content = result.content.map(toContentItemWithoutBinaryPayload);

  if (result.isError) {
    const errorText = content
      .flatMap((item) => (item.type === 'text' ? [item.text] : []))
      .join('\n');

    return {
      success: false,
      message: `MCP tool ${toolName} failed`,
      error: isNonEmptyString(errorText)
        ? errorText
        : 'The MCP server reported an error',
    };
  }

  return {
    success: true,
    message: `MCP tool ${toolName} executed`,
    result: isDefined(result.structuredContent)
      ? result.structuredContent
      : { content },
  };
};
