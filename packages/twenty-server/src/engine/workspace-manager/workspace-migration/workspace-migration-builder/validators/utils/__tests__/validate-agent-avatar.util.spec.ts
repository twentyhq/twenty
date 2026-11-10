import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { validateAgentAvatar } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-agent-avatar.util';

describe('validateAgentAvatar', () => {
  it('should return no error when the avatar is not set', () => {
    expect(validateAgentAvatar({ avatarColor: null })).toEqual([]);
  });

  it('should return no error for a known color and shape', () => {
    expect(
      validateAgentAvatar({ avatarColor: 'pink', avatarShape: 'pill' }),
    ).toEqual([]);
  });

  it('should return an error for an unknown color or shape', () => {
    const errors = validateAgentAvatar({
      avatarColor: 'teal',
      avatarShape: 'star',
    });

    expect(errors).toHaveLength(2);
    expect(errors.map(({ code }) => code)).toEqual([
      AiExceptionCode.INVALID_AGENT_INPUT,
      AiExceptionCode.INVALID_AGENT_INPUT,
    ]);
  });
});
