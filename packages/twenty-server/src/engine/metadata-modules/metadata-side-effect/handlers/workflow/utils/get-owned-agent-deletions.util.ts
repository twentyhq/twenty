import { isDefined } from 'twenty-shared/utils';

import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';

const isAgentOnlyRole = (role: FlatRole): boolean =>
  role.canBeAssignedToAgents &&
  !role.canBeAssignedToUsers &&
  !role.canBeAssignedToApiKeys;

export const getOwnedAgentDeletions = ({
  agentIds,
  flatAgents,
  flatRoleTargets,
  flatRoles,
}: {
  agentIds: string[];
  flatAgents: FlatAgent[];
  flatRoleTargets: FlatRoleTarget[];
  flatRoles: FlatRole[];
}): {
  agents: FlatAgent[];
  roleTargets: FlatRoleTarget[];
  roles: FlatRole[];
} => {
  const ownedAgentIds = new Set(agentIds);
  const agents = flatAgents.filter(
    ({ id, isSystem }) => isSystem && ownedAgentIds.has(id),
  );
  const deletedAgentIds = new Set(agents.map(({ id }) => id));

  const roleTargets = flatRoleTargets.filter(
    ({ agentId }) => isDefined(agentId) && deletedAgentIds.has(agentId),
  );
  const deletedRoleTargetIds = new Set(roleTargets.map(({ id }) => id));
  const roleIdsOfDeletedRoleTargets = new Set(
    roleTargets.map(({ roleId }) => roleId),
  );
  const roleIdsStillAssigned = new Set(
    flatRoleTargets
      .filter(({ id }) => !deletedRoleTargetIds.has(id))
      .map(({ roleId }) => roleId),
  );

  const roles = flatRoles.filter(
    (role) =>
      isAgentOnlyRole(role) &&
      roleIdsOfDeletedRoleTargets.has(role.id) &&
      !roleIdsStillAssigned.has(role.id),
  );

  return { agents, roleTargets, roles };
};
