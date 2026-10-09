import { listMcpToolNames } from 'test/integration/ai/suites/utils/list-mcp-tool-names.util';
import { makeMcpRequest } from 'test/integration/ai/suites/utils/make-mcp-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

describe('run_tool_script behind IS_CODE_MODE_ENABLED', () => {
  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_CODE_MODE_ENABLED,
      value: true,
      expectToFail: false,
    });
  });

  it('is listed when the flag is on', async () => {
    expect(await listMcpToolNames()).toContain('run_tool_script');
  });

  describe('when the flag is off', () => {
    beforeAll(async () => {
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_CODE_MODE_ENABLED,
        value: false,
        expectToFail: false,
      });
    });

    it('is not listed', async () => {
      const toolNames = await listMcpToolNames();

      expect(toolNames).toContain('execute_tool');
      expect(toolNames).not.toContain('run_tool_script');
    });

    it('cannot be called', async () => {
      const body = await makeMcpRequest({
        method: 'tools/call',
        params: { name: 'run_tool_script', arguments: { code: '1 + 1' } },
      });

      expect(body.error?.message).toBe('Unknown tool: run_tool_script');
    });
  });
});
