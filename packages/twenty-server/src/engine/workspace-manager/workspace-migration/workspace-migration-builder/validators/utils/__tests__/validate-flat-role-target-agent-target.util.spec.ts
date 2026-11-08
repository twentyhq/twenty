import { RoleTargetExceptionCode } from 'src/engine/metadata-modules/role/exceptions/role-target.exception';
import { validateFlatRoleTargetAgentTarget } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-role-target-agent-target.util';

const APP_UNIVERSAL_IDENTIFIER = '3b5e1f0a-7c2d-4e8f-9a1b-2c3d4e5f6a7b';
const OTHER_APP_UNIVERSAL_IDENTIFIER = '8d4c2b1a-6e5f-4a3b-8c7d-9e0f1a2b3c4d';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f';

const AGENT_ROLE_TARGET = {
  agentUniversalIdentifier: '5a6b7c8d-9e0f-4a1b-8c2d-3e4f5a6b7c8d',
};

const buildOptions = (applicationUniversalIdentifier: string) => ({
  applicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier:
    WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
});

const buildRole = (applicationUniversalIdentifier: string) => ({
  label: 'Agent Role',
  applicationUniversalIdentifier,
});

describe('validateFlatRoleTargetAgentTarget', () => {
  it('should allow an application to assign its own role to its agent', () => {
    expect(
      validateFlatRoleTargetAgentTarget({
        flatRole: buildRole(APP_UNIVERSAL_IDENTIFIER),
        flatRoleTarget: AGENT_ROLE_TARGET,
        buildOptions: buildOptions(APP_UNIVERSAL_IDENTIFIER),
      }),
    ).toEqual([]);
  });

  it.each([
    ['another application', OTHER_APP_UNIVERSAL_IDENTIFIER],
    ['the workspace', WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER],
  ])(
    'should refuse an application assigning a role owned by %s to its agent',
    (_, roleApplicationUniversalIdentifier) => {
      expect(
        validateFlatRoleTargetAgentTarget({
          flatRole: buildRole(roleApplicationUniversalIdentifier),
          flatRoleTarget: AGENT_ROLE_TARGET,
          buildOptions: buildOptions(APP_UNIVERSAL_IDENTIFIER),
        }).map(({ code }) => code),
      ).toEqual([RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY]);
    },
  );

  it('should allow the workspace custom application to assign a role it does not own to an agent', () => {
    expect(
      validateFlatRoleTargetAgentTarget({
        flatRole: buildRole(OTHER_APP_UNIVERSAL_IDENTIFIER),
        flatRoleTarget: AGENT_ROLE_TARGET,
        buildOptions: buildOptions(
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        ),
      }),
    ).toEqual([]);
  });

  it('should ignore role targets that are not agents', () => {
    expect(
      validateFlatRoleTargetAgentTarget({
        flatRole: buildRole(OTHER_APP_UNIVERSAL_IDENTIFIER),
        flatRoleTarget: { agentUniversalIdentifier: null },
        buildOptions: buildOptions(APP_UNIVERSAL_IDENTIFIER),
      }),
    ).toEqual([]);
  });
});
