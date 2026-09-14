import { msg, t } from '@lingui/core/macro';
import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type UniversalFlatRoleTarget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role-target.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

@Injectable()
export class RoleTargetRebindOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'role',
    name: 'roleTargetRebindOnDelete',
    description:
      'When a role is deleted, repoint its user, API key and agent role targets at the workspace default role. Role deletes are hard deletes and roleTarget.roleId cascades, so without the rebind the members of the deleted role are left with no role. Emitting the rebind as role target updates makes it visible in the migration plan. Role targets already handled by another operation of the migration are left to it, as are agent role targets whose agent is deleted in the same migration and API key role targets whose key is revoked or missing from the API key cache. Fails the deletion of the workspace default role, whose members would otherwise be left with no role, and fails the deletion when a remaining API key or agent role target cannot be assigned to the default role, so that those API keys or agents are reassigned first. Noop when the workspace has no resolvable default role, when the default role is deleted in the same migration, and when the deletion will be rejected because the role is not editable.',
  },
) {
  buildSideEffects({
    flatEntity: deletedUniversalFlatRole,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
    context,
  }: BuildSideEffectsArgs<'role'>): MetadataSideEffectResult {
    const workspaceDefaultRoleId =
      relatedFlatEntityMaps.flatWorkspace?.defaultRoleId;

    if (!isDefined(workspaceDefaultRoleId)) {
      return { status: 'noop' };
    }

    const defaultFlatRole = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: workspaceDefaultRoleId,
      flatEntityMaps: relatedFlatEntityMaps.flatRoleMaps,
    });

    const deletedFlatRole =
      relatedFlatEntityMaps.flatRoleMaps.byUniversalIdentifier[
        deletedUniversalFlatRole.universalIdentifier
      ];

    if (
      !isDefined(defaultFlatRole) ||
      !isDefined(deletedFlatRole) ||
      (!context.buildOptions.isSystemBuild && !deletedFlatRole.isEditable)
    ) {
      return { status: 'noop' };
    }

    const deletedRoleLabel = deletedFlatRole.label;

    if (
      defaultFlatRole.universalIdentifier ===
      deletedFlatRole.universalIdentifier
    ) {
      return this.failRoleDeletion({
        deletedFlatRole,
        errors: [
          {
            code: PermissionsExceptionCode.DEFAULT_ROLE_CANNOT_BE_DELETED,
            message: t`Cannot delete role "${deletedRoleLabel}": it is the workspace default role.`,
            userFriendlyMessage: msg`The default role cannot be deleted as it is required for the workspace to function properly.`,
          },
        ],
      });
    }

    if (
      isDefined(
        allFlatEntityOperationRecordByMetadataName.role?.flatEntityToDelete[
          defaultFlatRole.universalIdentifier
        ],
      )
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
        .filter((flatRoleTarget) => {
          if (!isDefined(flatRoleTarget.apiKeyId)) {
            return true;
          }

          const flatApiKey =
            relatedFlatEntityMaps.apiKeyMap[flatRoleTarget.apiKeyId];

          return isDefined(flatApiKey) && !isDefined(flatApiKey.revokedAt);
        });

    if (flatRoleTargetsToRebind.length === 0) {
      return { status: 'noop' };
    }

    const migratedDefaultFlatRole =
      allFlatEntityOperationRecordByMetadataName.role?.flatEntityToUpdate[
        defaultFlatRole.universalIdentifier
      ] ?? defaultFlatRole;

    const errors: FlatEntityValidationError[] = [];

    if (
      !migratedDefaultFlatRole.canBeAssignedToApiKeys &&
      flatRoleTargetsToRebind.some((flatRoleTarget) =>
        isDefined(flatRoleTarget.apiKeyId),
      )
    ) {
      errors.push({
        code: PermissionsExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_API_KEYS,
        message: t`Cannot delete role "${deletedRoleLabel}": the workspace default role cannot be assigned to API keys.`,
        userFriendlyMessage: msg`Cannot delete this role: it is still assigned to one or more API keys, and the workspace default role cannot be assigned to API keys. Please reassign these API keys to another role first.`,
      });
    }

    if (
      !migratedDefaultFlatRole.canBeAssignedToAgents &&
      flatRoleTargetsToRebind.some((flatRoleTarget) =>
        isDefined(flatRoleTarget.agentUniversalIdentifier),
      )
    ) {
      errors.push({
        code: PermissionsExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS,
        message: t`Cannot delete role "${deletedRoleLabel}": the workspace default role cannot be assigned to agents.`,
        userFriendlyMessage: msg`Cannot delete this role: it is still assigned to one or more agents, and the workspace default role cannot be assigned to agents. Please reassign these agents to another role first.`,
      });
    }

    if (isNonEmptyArray(errors)) {
      return this.failRoleDeletion({ deletedFlatRole, errors });
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

  private failRoleDeletion({
    deletedFlatRole,
    errors,
  }: {
    deletedFlatRole: Pick<FlatRole, 'universalIdentifier' | 'label'>;
    errors: FlatEntityValidationError[];
  }): MetadataSideEffectResult {
    return {
      status: 'fail',
      type: 'delete',
      metadataName: 'role',
      flatEntityMinimalInformation: {
        universalIdentifier: deletedFlatRole.universalIdentifier,
        label: deletedFlatRole.label,
      } as Partial<MetadataFlatEntity<'role'>>,
      errors,
    };
  }
}
