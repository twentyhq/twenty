import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { validateAgentAvatar } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-agent-avatar.util';

describe('validateAgentAvatar', () => {
  it('accepts supported customization and clearing either preference', () => {
    expect(
      validateAgentAvatar({ avatarColor: 'purple', avatarShape: 'flower' }),
    ).toEqual([]);
    expect(
      validateAgentAvatar({ avatarColor: null, avatarShape: null }),
    ).toEqual([]);
    expect(validateAgentAvatar({})).toEqual([]);
  });

  it('reports unsupported color and shape together', () => {
    const errors = validateAgentAvatar({
      avatarColor: 'rainbow',
      avatarShape: 'triangle',
    });

    expect(errors).toEqual([
      expect.objectContaining({
        code: AiExceptionCode.INVALID_AGENT_INPUT,
        message: expect.stringContaining('rainbow'),
      }),
      expect.objectContaining({
        code: AiExceptionCode.INVALID_AGENT_INPUT,
        message: expect.stringContaining('triangle'),
      }),
    ]);
  });
});
