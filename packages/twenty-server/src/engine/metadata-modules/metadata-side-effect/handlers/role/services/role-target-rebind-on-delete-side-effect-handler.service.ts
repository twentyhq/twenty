import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { type UniversalFlatRoleTarget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role-target.type';

@Injectable()
export class RoleTargetRebindOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'role',
    name: 'roleTargetRebindOnDelete',
    description:
      'When a role is deleted, repoint its user, API key and agent role targets at the workspace default role. Role deletes are hard deletes and roleTarget.roleId cascades, so without the rebind the members of the deleted role are left with no role. Emitting the rebind as role target updates makes it visible in the migration plan and subjects it to the role target validator, which rejects it when the default role cannot be assigned to that kind of target. Role targets already handled by another operation of the migration are left to it, as are agent role targets whose agent is deleted in the same migration and API key role targets whose key is revoked or gone. Noop when the workspace has no resolvable default role, when the deleted role is the default role or is deleted alongside it, and when the deletion will be rejected because the role is not editable.',
  },
) {
  buildSideEffects({
    flatEntity: deletedUniversalFlatRole,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
    context,
  }: BuildSideEffectsArgs<'role'>): MetadataSideEffectResult {
    if (!isDefined(context.workspaceDefaultRoleId)) {
      return { status: 'noop' };
    }

    const defaultFlatRole = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: context.workspaceDefaultRoleId,
      flatEntityMaps: relatedFlatEntityMaps.flatRoleMaps,
    });

    const deletedFlatRole =
      relatedFlatEntityMaps.flatRoleMaps.byUniversalIdentifier[
        deletedUniversalFlatRole.universalIdentifier
      ];

    if (
      !isDefined(defaultFlatRole) ||
      !isDefined(deletedFlatRole) ||
      defaultFlatRole.universalIdentifier ===
        deletedFlatRole.universalIdentifier ||
      isDefined(
        allFlatEntityOperationRecordByMetadataName.role?.flatEntityToDelete[
          defaultFlatRole.universalIdentifier
        ],
      ) ||
      (!context.buildOptions.isSystemBuild && !deletedFlatRole.isEditable)
    ) {
      return { status: 'noop' };
    }

    const roleTargetOperationRecord =
      allFlatEntityOperationRecordByMetadataName.roleTarget;

    const isHandledByAnotherRoleTargetOperation = (
      roleTargetUniversalIdentifier: string,
    ): boolean =>
      isDefined(roleTargetOperationRecord) &&
      [
        roleTargetOperationRecord.flatEntityToCreate,
        roleTargetOperationRecord.flatEntityToUpdate,
        roleTargetOperationRecord.flatEntityToDelete,
      ].some((flatEntityRecord) =>
        isDefined(flatEntityRecord[roleTargetUniversalIdentifier]),
      );

    const agentFlatEntityToDelete =
      allFlatEntityOperationRecordByMetadataName.agent?.flatEntityToDelete;

    const flatRoleTargetsToRebind =
      deletedFlatRole.roleTargetUniversalIdentifiers
        .map(
          (roleTargetUniversalIdentifier) =>
            relatedFlatEntityMaps.flatRoleTargetMaps.byUniversalIdentifier[
              roleTargetUniversalIdentifier
            ],
        )
        .filter(isDefined)
        .filter(
          (flatRoleTarget) =>
            !isHandledByAnotherRoleTargetOperation(
              flatRoleTarget.universalIdentifier,
            ),
        )
        .filter(
          (flatRoleTarget) =>
            !isDefined(flatRoleTarget.agentUniversalIdentifier) ||
            !isDefined(
              agentFlatEntityToDelete?.[
                flatRoleTarget.agentUniversalIdentifier
              ],
            ),
        )
        .filter(
          (flatRoleTarget) =>
            !isDefined(flatRoleTarget.apiKeyId) ||
            context.activeApiKeyIds.includes(flatRoleTarget.apiKeyId),
        );

    if (flatRoleTargetsToRebind.length === 0) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        roleTarget: {
          flatEntityToUpdate: Object.fromEntries(
            flatRoleTargetsToRebind.map((flatRoleTarget) => {
              const reboundUniversalFlatRoleTarget: UniversalFlatRoleTarget = {
                ...flatRoleTarget,
                roleUniversalIdentifier: defaultFlatRole.universalIdentifier,
              };

              return [
                reboundUniversalFlatRoleTarget.universalIdentifier,
                reboundUniversalFlatRoleTarget,
              ];
            }),
          ),
        },
      },
    };
  }
}
