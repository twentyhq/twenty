import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PermissionFlagType } from 'twenty-shared/constants';
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
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
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
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(ObjectPermissionEntity)
    private readonly objectPermissionRepository: Repository<ObjectPermissionEntity>,
    @InjectRepository(PermissionFlagEntity)
    private readonly permissionFlagRepository: Repository<PermissionFlagEntity>,
    @InjectRepository(FieldPermissionEntity)
    private readonly fieldPermissionRepository: Repository<FieldPermissionEntity>,
    @InjectRepository(RowLevelPermissionPredicateEntity)
    private readonly rowLevelPermissionPredicateRepository: Repository<RowLevelPermissionPredicateEntity>,
    @InjectRepository(RowLevelPermissionPredicateGroupEntity)
    private readonly rowLevelPermissionPredicateGroupRepository: Repository<RowLevelPermissionPredicateGroupEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<ObjectsPermissionsByRoleId> {
    const [
      roles,
      objectPermissions,
      permissionFlags,
      fieldPermissions,
      rowLevelPermissionPredicates,
      rowLevelPermissionPredicateGroups,
      workspaceObjectMetadataCollection,
    ] = await Promise.all([
      this.roleRepository.find({
        where: { workspaceId },
      }),
      this.objectPermissionRepository.find({
        where: { workspaceId },
      }),
      this.permissionFlagRepository.find({
        where: { workspaceId },
      }),
      this.fieldPermissionRepository.find({
        where: { workspaceId },
      }),
      this.rowLevelPermissionPredicateRepository.find({
        where: { workspaceId, deletedAt: IsNull() },
      }),
      this.rowLevelPermissionPredicateGroupRepository.find({
        where: { workspaceId, deletedAt: IsNull() },
      }),
      this.getWorkspaceObjectMetadataCollection(workspaceId),
    ]);

    const objectPermissionsByRoleId =
      regroupEntitiesByRelatedEntityId<'objectPermission'>({
        entities: objectPermissions,
        foreignKey: 'roleId',
      });
    const permissionFlagsByRoleId =
      regroupEntitiesByRelatedEntityId<'permissionFlag'>({
        entities: permissionFlags,
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
      const rolePermissionFlags = permissionFlagsByRoleId.get(role.id) ?? [];
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
              rolePermissionFlags,
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
                rolePermissionFlags,
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
            ) => (isSystem ? true : (overrideValue ?? defaultValue));

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
    permissionFlags: PermissionFlagEntity[],
    permissionFlagType: PermissionFlagType,
  ): boolean {
    const hasPermissionFromRole = role.canUpdateAllSettings;
    const hasPermissionFromSettingPermissions = isDefined(
      permissionFlags.find(
        (permissionFlag) => permissionFlag.flag === permissionFlagType,
      ),
    );

    return hasPermissionFromRole || hasPermissionFromSettingPermissions;
  }
}
