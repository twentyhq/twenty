import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { validateRoleTargetsRebindToDefaultRoleOrThrow } from 'src/engine/metadata-modules/role/utils/validate-role-targets-rebind-to-default-role-or-throw.util';

const MEMBER_FLAT_ROLE = {
  label: 'Member',
  canBeAssignedToApiKeys: false,
  canBeAssignedToAgents: false,
};

describe('validateRoleTargetsRebindToDefaultRoleOrThrow', () => {
  it.each([
    [
      'an API key',
      { apiKeyId: 'api-key-id', agentId: null },
      PermissionsExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_API_KEYS,
    ],
    [
      'an agent',
      { apiKeyId: null, agentId: 'agent-id' },
      PermissionsExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS,
    ],
  ])(
    'should refuse moving %s to a default role that cannot take it',
    (_, flatRoleTarget, code) => {
      expect(() =>
        validateRoleTargetsRebindToDefaultRoleOrThrow({
          defaultFlatRole: MEMBER_FLAT_ROLE,
          flatRoleTargetsToCreate: [flatRoleTarget],
        }),
      ).toThrow(expect.objectContaining({ code }));
    },
  );

  it('should allow moving API keys and agents to a default role that takes them', () => {
    expect(() =>
      validateRoleTargetsRebindToDefaultRoleOrThrow({
        defaultFlatRole: {
          label: 'Integrations',
          canBeAssignedToApiKeys: true,
          canBeAssignedToAgents: true,
        },
        flatRoleTargetsToCreate: [
          { apiKeyId: 'api-key-id', agentId: null },
          { apiKeyId: null, agentId: 'agent-id' },
        ],
      }),
    ).not.toThrow();
  });
});
