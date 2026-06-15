import { EXECUTE_TOOL_TOOL_NAME } from 'src/engine/core-modules/tool-provider/tools';
import { resolveToolName } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-tool-name.util';

describe('resolveToolName', () => {
  it('returns the inner toolName when the wrapper is execute_tool', () => {
    const resolved = resolveToolName({
      toolName: EXECUTE_TOOL_TOOL_NAME,
      input: { toolName: 'find_records', arguments: { limit: 10 } },
    });

    expect(resolved).toBe('find_records');
  });

  it('returns the part toolName as-is for non-execute_tool wrappers', () => {
    expect(
      resolveToolName({
        toolName: 'learn_tools',
        input: { toolNames: ['find_records'] },
      }),
    ).toBe('learn_tools');

    expect(
      resolveToolName({
        toolName: 'load_skills',
        input: { skillNames: ['workflow-building'] },
      }),
    ).toBe('load_skills');

    expect(
      resolveToolName({
        toolName: 'app_exa_web_search',
        input: { query: 'twenty crm' },
      }),
    ).toBe('app_exa_web_search');
  });

  it('falls back to a sentinel when execute_tool input is malformed', () => {
    expect(
      resolveToolName({
        toolName: EXECUTE_TOOL_TOOL_NAME,
        input: undefined,
      }),
    ).toBe(`${EXECUTE_TOOL_TOOL_NAME}:unknown`);

    expect(
      resolveToolName({
        toolName: EXECUTE_TOOL_TOOL_NAME,
        input: { toolName: '' },
      }),
    ).toBe(`${EXECUTE_TOOL_TOOL_NAME}:unknown`);

    expect(
      resolveToolName({
        toolName: EXECUTE_TOOL_TOOL_NAME,
        input: { toolName: 42 },
      }),
    ).toBe(`${EXECUTE_TOOL_TOOL_NAME}:unknown`);
  });
});
