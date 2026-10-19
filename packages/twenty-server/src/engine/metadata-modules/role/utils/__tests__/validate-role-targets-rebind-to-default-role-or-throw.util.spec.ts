import { MEMBER_ROLE_UNIVERSAL_IDENTIFIER } from 'src/engine/metadata-modules/permissions/constants/member-role-universal-identifier.constants';
import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { validateRoleTargetsRebindToDefaultRoleOrThrow } from 'src/engine/metadata-modules/role/utils/validate-role-targets-rebind-to-default-role-or-throw.util';

const CUSTOM_FLAT_ROLE = {
  isEditable: true,
  universalIdentifier: '6f1c2a54-91d3-4b7e-a0f2-3c8d5e7b9a10',
};

const MEMBER_FLAT_ROLE = {
  label: 'Member',
  canBeAssignedToApiKeys: false,
  canBeAssignedToAgents: false,
};

const API_KEY_ROLE_TARGET = { apiKeyId: 'api-key-id', agentId: null };

describe('validateRoleTargetsRebindToDefaultRoleOrThrow', () => {
  it.each([
    [
      'an API key',
      API_KEY_ROLE_TARGET,
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
          flatRolesToDelete: [CUSTOM_FLAT_ROLE],
          defaultFlatRole: MEMBER_FLAT_ROLE,
          flatRoleTargetsToCreate: [flatRoleTarget],
        }),
      ).toThrow(expect.objectContaining({ code }));
    },
  );

  it('should allow moving API keys and agents to a default role that takes them', () => {
    expect(() =>
      validateRoleTargetsRebindToDefaultRoleOrThrow({
        flatRolesToDelete: [CUSTOM_FLAT_ROLE],
        defaultFlatRole: {
          label: 'Integrations',
          canBeAssignedToApiKeys: true,
          canBeAssignedToAgents: true,
        },
        flatRoleTargetsToCreate: [
          API_KEY_ROLE_TARGET,
          { apiKeyId: null, agentId: 'agent-id' },
        ],
      }),
    ).not.toThrow();
  });

  it.each([
    ['a non-editable role', { ...CUSTOM_FLAT_ROLE, isEditable: false }],
    [
      'Member',
      {
        ...CUSTOM_FLAT_ROLE,
        universalIdentifier: MEMBER_ROLE_UNIVERSAL_IDENTIFIER,
      },
    ],
  ])(
    'should leave the deletion of %s to the role validator',
    (_, flatRoleToDelete) => {
      expect(() =>
        validateRoleTargetsRebindToDefaultRoleOrThrow({
          flatRolesToDelete: [flatRoleToDelete],
          defaultFlatRole: MEMBER_FLAT_ROLE,
          flatRoleTargetsToCreate: [API_KEY_ROLE_TARGET],
        }),
      ).not.toThrow();
    },
  );
});
