import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { STANDARD_AGENT } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-agent.constant';
import { STANDARD_ROLE_TARGET } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role-target.constant';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import { type AllStandardAgentName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-agent-name.type';
import { type AllStandardRoleName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-role-name.type';
import { type AllStandardRoleTargetName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-role-target-name.type';
import { type AllStandardRoleTargetTypeName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-role-target-type-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';

export type CreateStandardRoleTargetContext<
  T extends AllStandardRoleTargetTypeName = AllStandardRoleTargetTypeName,
> = {
  roleTargetTypeName: T;
  roleTargetName: AllStandardRoleTargetName<T>;
  roleName: AllStandardRoleName;
  agentName: T extends 'agent' ? AllStandardAgentName : null;
};

export type CreateStandardRoleTargetArgs<
  T extends AllStandardRoleTargetTypeName = AllStandardRoleTargetTypeName,
> = StandardBuilderArgs<'roleTarget'> & {
  context: CreateStandardRoleTargetContext<T>;
};

const findIdByUniversalIdentifier = <T extends SyncableFlatEntity>(
  flatEntityMaps: FlatEntityMaps<T>,
  universalIdentifier: string,
): string => {
  const id = flatEntityMaps.idByUniversalIdentifier[universalIdentifier];

  if (!id) {
    throw new Error(
      `Could not find entity with universalIdentifier: ${universalIdentifier}`,
    );
  }

  return id;
};

export const createStandardRoleTargetFlatMetadata = <
  T extends AllStandardRoleTargetTypeName,
>({
  context: { roleTargetTypeName, roleTargetName, roleName, agentName },
  workspaceId,
  twentyStandardApplicationId,
  now,
  dependencyFlatEntityMaps: { flatRoleMaps, flatAgentMaps },
}: CreateStandardRoleTargetArgs<T>): FlatRoleTarget => {
  const roleDefinition = STANDARD_ROLE_TARGET[roleTargetTypeName];
  const roleTargetUniversalIdentifier =
    //@ts-expect-error ignore
    roleDefinition[roleTargetName].universalIdentifier;

  const roleUniversalIdentifier = STANDARD_ROLE[roleName].universalIdentifier;
  const roleId = findIdByUniversalIdentifier(
    flatRoleMaps as FlatEntityMaps<FlatRole>,
    roleUniversalIdentifier,
  );

  let agentId: string | null = null;

  if (roleTargetTypeName === 'agent' && agentName) {
    const agentUniversalIdentifier =
      STANDARD_AGENT[agentName as AllStandardAgentName].universalIdentifier;

    agentId =
      flatAgentMaps.idByUniversalIdentifier[agentUniversalIdentifier] ?? null;

    if (!isDefined(agentId)) {
      throw new Error(`Could not find agent id ${agentUniversalIdentifier}`);
    }
  }

  return {
    id: v4(),
    universalIdentifier: roleTargetUniversalIdentifier,
    roleId,
    userWorkspaceId: null,
    agentId,
    apiKeyId: null,
    targetApplicationId: null,
    workspaceId,
    applicationId: twentyStandardApplicationId,
    createdAt: now,
    updatedAt: now,
  };
};
