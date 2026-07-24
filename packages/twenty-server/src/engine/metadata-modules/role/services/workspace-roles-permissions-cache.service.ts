import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';

const WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.workflow.universalIdentifier,
  STANDARD_OBJECTS.workflowRun.universalIdentifier,
  STANDARD_OBJECTS.workflowVersion.universalIdentifier,
] as const;
const WORKSPACE_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workspaceMember.universalIdentifier;

@Injectable()
@WorkspaceCache('rolesPermissions')
export class WorkspaceRolesPermissionsCacheService extends WorkspaceCacheProvider<ObjectsPermissionsByRoleId> {
  constructor(
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectWorkspaceScopedRepository(RoleEntity)
    private readonly roleRepository: WorkspaceScopedRepository<RoleEntity>,
    @InjectWorkspaceScopedRepository(ObjectPermissionEntity)
    private readonly objectPermissionRepository: WorkspaceScopedRepository<ObjectPermissionEntity>,
    @InjectRepository(RolePermissionFlagEntity)
    private readonly rolePermissionFlagRepository: Repository<RolePermissionFlagEntity>,
    @InjectWorkspaceScopedRepository(FieldPermissionEntity)
    private readonly fieldPermissionRepository: WorkspaceScopedRepository<FieldPermissionEntity>,
    @InjectWorkspaceScopedRepository(RowLevelPermissionPredicateEntity)
    private readonly rowLevelPermissionPredicateRepository: WorkspaceScopedRepository<RowLevelPermissionPredicateEntity>,
    @InjectWorkspaceScopedRepository(RowLevelPermissionPredicateGroupEntity)
    private readonly rowLevelPermissionPredicateGroupRepository: WorkspaceScopedRepository<RowLevelPermissionPredicateGroupEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<ObjectsPermissionsByRoleId> {
    const [
      roles,
      objectPermissions,
      rolePermissionFlags,
      fieldPermissions,
      rowLevelPermissionPredicates,
      rowLevelPermissionPredicateGroups,
      workspaceObjectMetadataCollection,
    ] = await Promise.all([
      this.roleRepository.find(workspaceId),
      this.objectPermissionRepository.find(workspaceId),
      this.rolePermissionFlagRepository.find({
        where: { workspaceId },
        relations: ['permissionFlag'],
      }),
      this.fieldPermissionRepository.find(workspaceId),
      this.rowLevelPermissionPredicateRepository.find(workspaceId, {
        where: { deletedAt: IsNull() },
      }),
      this.rowLevelPermissionPredicateGroupRepository.find(workspaceId, {
        where: { deletedAt: IsNull() },
      }),
      this.getWorkspaceObjectMetadataCollection(workspaceId),
    ]);

    const objectPermissionsByRoleId =
      regroupEntitiesByRelatedEntityId<'objectPermission'>({
        entities: objectPermissions,
        foreignKey: 'roleId',
      });
    const rolePermissionFlagsByRoleId =
      regroupEntitiesByRelatedEntityId<'rolePermissionFlag'>({
        entities: rolePermissionFlags,
        foreignKey: 'roleId',
      });
    const fieldPermissionsByRoleId =
      regroupEntitiesByRelatedEntityId<'fieldPermission'>({
        entities: fieldPermissions,
        foreignKey: 'roleId',
      });
    const rowLevelPermissionPredicatesByRoleId =
      regroupEntitiesByRelatedEntityId<'rowLevelPermissionPredicate'>({
        entities: rowLevelPermissionPredicates,
        foreignKey: 'roleId',
      });
    const rowLevelPermissionPredicateGroupsByRoleId =
      regroupEntitiesByRelatedEntityId<'rowLevelPermissionPredicateGroup'>({
        entities: rowLevelPermissionPredicateGroups,
        foreignKey: 'roleId',
      });

    const permissionsByRoleId: ObjectsPermissionsByRoleId = {};

    for (const role of roles) {
      const roleObjectPermissions =
        objectPermissionsByRoleId.get(role.id) ?? [];
      const roleRolePermissionFlags =
        rolePermissionFlagsByRoleId.get(role.id) ?? [];
      const roleFieldPermissions = fieldPermissionsByRoleId.get(role.id) ?? [];
      const roleRowLevelPermissionPredicates =
        rowLevelPermissionPredicatesByRoleId.get(role.id) ?? [];
      const roleRowLevelPermissionPredicateGroups =
        rowLevelPermissionPredicateGroupsByRoleId.get(role.id) ?? [];

      const objectRecordsPermissions: ObjectsPermissions = {};

      for (const objectMetadata of workspaceObjectMetadataCollection) {
        const {
          id: objectMetadataId,
          isSystem,
          universalIdentifier,
        } = objectMetadata;

        let canRead = role.canReadAllObjectRecords;
        let canUpdate = role.canUpdateAllObjectRecords;
        let canSoftDelete = role.canSoftDeleteAllObjectRecords;
        let canDestroy = role.canDestroyAllObjectRecords;
        const restrictedFields: RestrictedFieldsPermissions = {};

        const isWorkspaceMemberObject =
          universalIdentifier === WORKSPACE_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER;
        const isWorkflowRelatedObject =
          WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.includes(
            universalIdentifier as (typeof WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS)[number],
          );

        if (isWorkflowRelatedObject) {
          const hasWorkflowsPermissions =
            this.hasSettingsGatedObjectPermissions(
              role,
              roleRolePermissionFlags,
              PermissionFlagType.WORKFLOWS,
            );

          canRead = hasWorkflowsPermissions;
          canUpdate = hasWorkflowsPermissions;
          canSoftDelete = hasWorkflowsPermissions;
          canDestroy = hasWorkflowsPermissions;
        } else {
          if (isWorkspaceMemberObject) {
            const hasWorkspaceMembersPermissions =
              this.hasSettingsGatedObjectPermissions(
                role,
                roleRolePermissionFlags,
                PermissionFlagType.WORKSPACE_MEMBERS,
              );

            canRead = true;
            canUpdate = hasWorkspaceMembersPermissions;
            canSoftDelete = hasWorkspaceMembersPermissions;
            canDestroy = hasWorkspaceMembersPermissions;
          } else {
            const objectRecordPermissionsOverride = roleObjectPermissions.find(
              (objectPermission) =>
                objectPermission.objectMetadataId === objectMetadataId,
            );

            const getPermissionValue = (
              overrideValue: boolean | undefined,
              defaultValue: boolean,
            ) => overrideValue ?? (isSystem ? true : defaultValue);

            canRead = getPermissionValue(
              objectRecordPermissionsOverride?.canReadObjectRecords,
              canRead,
            );
            canUpdate = getPermissionValue(
              objectRecordPermissionsOverride?.canUpdateObjectRecords,
              canUpdate,
            );
            canSoftDelete = getPermissionValue(
              objectRecordPermissionsOverride?.canSoftDeleteObjectRecords,
              canSoftDelete,
            );
            canDestroy = getPermissionValue(
              objectRecordPermissionsOverride?.canDestroyObjectRecords,
              canDestroy,
            );
          }

          const fieldPermissionsForObject = roleFieldPermissions.filter(
            (fieldPermission) =>
              fieldPermission.objectMetadataId === objectMetadataId,
          );

          for (const fieldPermission of fieldPermissionsForObject) {
            const isFieldLabelIdentifier =
              fieldPermission.fieldMetadataId ===
              objectMetadata.labelIdentifierFieldMetadataId;

            if (
              isDefined(fieldPermission.canReadFieldValue) ||
              isDefined(fieldPermission.canUpdateFieldValue)
            ) {
              restrictedFields[fieldPermission.fieldMetadataId] = {
                canRead: isFieldLabelIdentifier
                  ? true
                  : fieldPermission.canReadFieldValue,
                canUpdate: fieldPermission.canUpdateFieldValue,
              };
            }
          }
        }

        objectRecordsPermissions[objectMetadataId] = {
          canReadObjectRecords: canRead,
          canUpdateObjectRecords: canUpdate,
          canSoftDeleteObjectRecords: canSoftDelete,
          canDestroyObjectRecords: canDestroy,
          restrictedFields,
          rowLevelPermissionPredicates: roleRowLevelPermissionPredicates.filter(
            (rowLevelPermissionPredicate) =>
              rowLevelPermissionPredicate.objectMetadataId === objectMetadataId,
          ),
          rowLevelPermissionPredicateGroups:
            roleRowLevelPermissionPredicateGroups.filter(
              (rowLevelPermissionPredicateGroup) =>
                rowLevelPermissionPredicateGroup.objectMetadataId ===
                objectMetadataId,
            ),
        };
      }

      permissionsByRoleId[role.id] = objectRecordsPermissions;
    }

    return permissionsByRoleId;
  }

  private async getWorkspaceObjectMetadataCollection(
    workspaceId: string,
  ): Promise<ObjectMetadataEntity[]> {
    const workspaceObjectMetadata = await this.objectMetadataRepository.find({
      where: {
        workspaceId,
      },
      select: [
        'id',
        'isSystem',
        'universalIdentifier',
        'labelIdentifierFieldMetadataId',
      ],
    });

    return workspaceObjectMetadata;
  }

  private hasSettingsGatedObjectPermissions(
    role: RoleEntity,
    rolePermissionFlags: RolePermissionFlagEntity[],
    permissionFlagType: PermissionFlagType,
  ): boolean {
    const hasPermissionFromRole = role.canUpdateAllSettings;
    const permissionFlagUniversalIdentifier =
      SystemPermissionFlag[permissionFlagType];
    const hasPermissionFromSettingPermissions = isDefined(
      rolePermissionFlags.find(
        (rolePermissionFlag) =>
          this.getRolePermissionFlagUniversalIdentifier(rolePermissionFlag) ===
          permissionFlagUniversalIdentifier,
      ),
    );

    return hasPermissionFromRole || hasPermissionFromSettingPermissions;
  }

  private getRolePermissionFlagUniversalIdentifier(
    rolePermissionFlag: RolePermissionFlagEntity,
  ): string {
    // The `permissionFlag` relation is stripped during upgrades until the 2.6.0
    // cursor (@WasIntroducedInUpgrade), so fall back to the legacy `flag` column.
    return (
      rolePermissionFlag.permissionFlag?.universalIdentifier ??
      SystemPermissionFlag[rolePermissionFlag.flag as PermissionFlagType]
    );
  }
}
