import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { validateAgentAvatarWithOverrides } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-agent-avatar-with-overrides.util';

it.each([
  { name: 'legacy flat', overrides: { avatarColor: 'neon' } },
  {
    name: 'authored',
    overrides: {
      'workspace-application': { avatarColor: 'blue' },
      'another-application': { avatarColor: 'neon' },
    },
  },
])('validates avatar values in $name overrides', ({ overrides }) => {
  expect(
    validateAgentAvatarWithOverrides({
      agent: { avatarColor: 'purple', avatarShape: 'flower', overrides },
      workspaceCustomApplicationUniversalIdentifier: 'workspace-application',
    }),
  ).toEqual([
    expect.objectContaining({
      code: AiExceptionCode.INVALID_AGENT_INPUT,
      message: expect.stringContaining('neon'),
    }),
  ]);
});
