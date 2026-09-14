import { isDefined } from 'twenty-shared/utils';

import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type UniversalUpdateRoleTargetAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role-target/types/workspace-migration-role-target-action.type';
import { type UniversalCreateRoleAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role/types/workspace-migration-role-action.type';

export const partitionRoleActionsAroundRoleDeletes = ({
  role,
  roleTarget,
}: OrchestratorActionsReport): {
  roleCreateActionsBeforeRoleDelete: UniversalCreateRoleAction[];
  roleCreateActionsAfterRoleDelete: UniversalCreateRoleAction[];
  roleTargetUpdateActionsBeforeRoleDelete: UniversalUpdateRoleTargetAction[];
  roleTargetUpdateActionsAfterRoleTargetCreate: UniversalUpdateRoleTargetAction[];
} => {
  const deletedRoleLabels = role.delete.map(
    (deleteRoleAction) => deleteRoleAction.flatEntity?.label,
  );

  const canRunRoleCreateBeforeRoleDelete = (
    createRoleAction: UniversalCreateRoleAction,
  ): boolean =>
    deletedRoleLabels.every(
      (deletedRoleLabel) =>
        isDefined(deletedRoleLabel) &&
        deletedRoleLabel !== createRoleAction.flatEntity.label,
    );

  const roleCreateActionsBeforeRoleDelete = role.create.filter(
    canRunRoleCreateBeforeRoleDelete,
  );

  const roleCreateActionsAfterRoleDelete = role.create.filter(
    (createRoleAction) => !canRunRoleCreateBeforeRoleDelete(createRoleAction),
  );

  const roleUniversalIdentifiersCreatedAfterRoleDelete = new Set(
    roleCreateActionsAfterRoleDelete.map(
      (createRoleAction) => createRoleAction.flatEntity.universalIdentifier,
    ),
  );

  const canRunRoleTargetUpdateBeforeRoleDelete = ({
    update,
  }: UniversalUpdateRoleTargetAction): boolean =>
    isDefined(update.roleUniversalIdentifier) &&
    !roleUniversalIdentifiersCreatedAfterRoleDelete.has(
      update.roleUniversalIdentifier,
    ) &&
    Object.keys(update).every(
      (propertyName) => propertyName === 'roleUniversalIdentifier',
    );

  return {
    roleCreateActionsBeforeRoleDelete,
    roleCreateActionsAfterRoleDelete,
    roleTargetUpdateActionsBeforeRoleDelete: roleTarget.update.filter(
      canRunRoleTargetUpdateBeforeRoleDelete,
    ),
    roleTargetUpdateActionsAfterRoleTargetCreate: roleTarget.update.filter(
      (updateRoleTargetAction) =>
        !canRunRoleTargetUpdateBeforeRoleDelete(updateRoleTargetAction),
    ),
  };
};
