import { WORKSPACE_SETUP_ALTERNATIVE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-alternative-system-prompt.constant';
import { WORKSPACE_SETUP_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-system-prompt.constant';
import { getWorkspaceSetupSystemPrompt } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-workspace-setup-system-prompt.util';

describe('getWorkspaceSetupSystemPrompt', () => {
  it.each([
    '20202020-1c25-4d02-bf25-6aeccf7ea410',
    '20202020-1c25-4d02-bf25-6aeccf7ea418',
    '20202020-1c25-4d02-bf25-6aeccf7ea41a',
    '20202020-1c25-4d02-bf25-6aeccf7ea41e',
  ])(
    'should give the original prompt to even workspace id %s',
    (workspaceId) => {
      expect(getWorkspaceSetupSystemPrompt(workspaceId)).toBe(
        WORKSPACE_SETUP_SYSTEM_PROMPT,
      );
    },
  );

  it.each([
    '20202020-1c25-4d02-bf25-6aeccf7ea411',
    '20202020-1c25-4d02-bf25-6aeccf7ea419',
    '20202020-1c25-4d02-bf25-6aeccf7ea41b',
    '20202020-1c25-4d02-bf25-6aeccf7ea41f',
  ])(
    'should give the alternative prompt to odd workspace id %s',
    (workspaceId) => {
      expect(getWorkspaceSetupSystemPrompt(workspaceId)).toBe(
        WORKSPACE_SETUP_ALTERNATIVE_SYSTEM_PROMPT,
      );
    },
  );
});
