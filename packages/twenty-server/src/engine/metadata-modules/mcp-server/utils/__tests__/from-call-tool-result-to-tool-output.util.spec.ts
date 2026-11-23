import { fromCallToolResultToToolOutput } from 'src/engine/metadata-modules/mcp-server/utils/from-call-tool-result-to-tool-output.util';

describe('fromCallToolResultToToolOutput', () => {
  it('prefers structured content over the content blocks', () => {
    expect(
      fromCallToolResultToToolOutput({
        toolName: 'list_issues',
        result: {
          content: [{ type: 'text', text: '{"issues":[]}' }],
          structuredContent: { issues: [] },
        },
      }),
    ).toEqual({
      success: true,
      message: 'MCP tool list_issues executed',
      result: { issues: [] },
    });
  });

  it('keeps text blocks and strips binary payloads', () => {
    expect(
      fromCallToolResultToToolOutput({
        toolName: 'render',
        result: {
          content: [
            { type: 'text', text: 'done' },
            { type: 'image', data: 'aGVsbG8=', mimeType: 'image/png' },
          ],
        },
      }).result,
    ).toEqual({
      content: [
        { type: 'text', text: 'done' },
        { type: 'image', mimeType: 'image/png' },
      ],
    });
  });

  it('keeps the text of an embedded resource and drops its blob', () => {
    expect(
      fromCallToolResultToToolOutput({
        toolName: 'read_page',
        result: {
          content: [
            {
              type: 'resource',
              resource: { uri: 'docs://pricing', text: 'Pricing page' },
            },
            {
              type: 'resource',
              resource: { uri: 'docs://logo', blob: 'aGVsbG8=' },
            },
          ],
        },
      }).result,
    ).toEqual({
      content: [
        { type: 'resource', uri: 'docs://pricing', text: 'Pricing page' },
        { type: 'resource', uri: 'docs://logo' },
      ],
    });
  });

  it('turns an error result into a failed output with the server text', () => {
    expect(
      fromCallToolResultToToolOutput({
        toolName: 'list_issues',
        result: {
          isError: true,
          content: [{ type: 'text', text: 'repository not found' }],
        },
      }),
    ).toEqual({
      success: false,
      message: 'MCP tool list_issues failed',
      error: 'repository not found',
    });
  });
});
