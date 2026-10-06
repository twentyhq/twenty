import { getOwnedAgentDeletions } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow/utils/get-owned-agent-deletions.util';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';

const agent = (id: string, isSystem: boolean) =>
  ({ id, isSystem }) as FlatAgent;

const roleTarget = (id: string, roleId: string, agentId: string | null) =>
  ({ id, roleId, agentId }) as FlatRoleTarget;

const role = (
  id: string,
  {
    canBeAssignedToAgents = true,
    canBeAssignedToUsers = false,
    canBeAssignedToApiKeys = false,
  } = {},
) =>
  ({
    id,
    canBeAssignedToAgents,
    canBeAssignedToUsers,
    canBeAssignedToApiKeys,
  }) as FlatRole;

describe('getOwnedAgentDeletions', () => {
  it('deletes the system agents with their role targets and the agent-only roles left unassigned', () => {
    const { agents, roleTargets, roles } = getOwnedAgentDeletions({
      agentIds: ['owned-agent'],
      flatAgents: [agent('owned-agent', true), agent('other-agent', true)],
      flatRoleTargets: [
        roleTarget('owned-target', 'agent-role', 'owned-agent'),
        roleTarget('other-target', 'other-agent-role', 'other-agent'),
      ],
      flatRoles: [role('agent-role'), role('other-agent-role')],
    });

    expect(agents.map(({ id }) => id)).toEqual(['owned-agent']);
    expect(roleTargets.map(({ id }) => id)).toEqual(['owned-target']);
    expect(roles.map(({ id }) => id)).toEqual(['agent-role']);
  });

  it('keeps roles still assigned elsewhere or assignable to users and API keys', () => {
    const { roles } = getOwnedAgentDeletions({
      agentIds: ['first-agent', 'second-agent'],
      flatAgents: [agent('first-agent', true), agent('second-agent', true)],
      flatRoleTargets: [
        roleTarget('first-target', 'shared-role', 'first-agent'),
        roleTarget('kept-target', 'shared-role', 'kept-agent'),
        roleTarget('second-target', 'member-role', 'second-agent'),
      ],
      flatRoles: [
        role('shared-role'),
        role('member-role', { canBeAssignedToUsers: true }),
      ],
    });

    expect(roles).toEqual([]);
  });

  it('never deletes agents that are not system agents', () => {
    const { agents, roleTargets } = getOwnedAgentDeletions({
      agentIds: ['user-agent'],
      flatAgents: [agent('user-agent', false)],
      flatRoleTargets: [roleTarget('user-target', 'agent-role', 'user-agent')],
      flatRoles: [role('agent-role')],
    });

    expect(agents).toEqual([]);
    expect(roleTargets).toEqual([]);
  });
});
