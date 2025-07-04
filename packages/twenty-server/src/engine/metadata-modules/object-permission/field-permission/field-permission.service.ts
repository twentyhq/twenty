import { InjectRepository } from '@nestjs/typeorm';

import { ObjectRecordsPermissionsByRoleId } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { UpsertFieldPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-field-permissions.input';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import {
    PermissionsException,
    PermissionsExceptionCode,
    PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

export class FieldPermissionService {
  constructor(
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(FieldPermissionEntity, 'core')
    private readonly fieldPermissionsRepository: Repository<FieldPermissionEntity>,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  public async upsertFieldPermissions({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: UpsertFieldPermissionsInput;
  }): Promise<FieldPermissionEntity[]> {
    const role = await this.getRoleOrThrow({
      roleId: input.roleId,
      workspaceId,
    });

    const { data: rolesPermissions } =
      await this.workspacePermissionsCacheService.getRolesPermissionsFromCache({
        workspaceId,
      });

    await this.validateRoleIsEditableOrThrow({
      role,
    });

    const { byId: objectMetadataMapsById } =
      await this.workspaceCacheStorageService.getObjectMetadataMapsOrThrow(
        workspaceId,
      );

    input.fieldPermissions.forEach((fieldPermission) => {
      this.validateFieldPermission({
        fieldPermission,
        objectMetadataMapsById,
        rolesPermissions,
        role,
      });
    });

    const fieldPermissions = input.fieldPermissions.map((fieldPermission) => ({
      ...fieldPermission,
      roleId: input.roleId,
      workspaceId,
    }));

    await this.fieldPermissionsRepository.upsert(fieldPermissions, {
      conflictPaths: ['fieldMetadataId', 'roleId'],
    });

    await this.workspacePermissionsCacheService.recomputeRolesPermissionsCache({
      workspaceId,
      roleIds: [input.roleId],
    });

    return this.fieldPermissionsRepository.find({
      where: {
        roleId: input.roleId,
        objectMetadataId: In(
          input.fieldPermissions.map(
            (fieldPermission) => fieldPermission.objectMetadataId,
          ),
        ),
      },
    });
  }

  private validateFieldPermission({
    fieldPermission,
    objectMetadataMapsById,
    rolesPermissions,
    role,
  }: {
    fieldPermission: UpsertFieldPermissionsInput['fieldPermissions'][0];
    objectMetadataMapsById: Record<string, ObjectMetadataItemWithFieldMaps>;
    rolesPermissions: ObjectRecordsPermissionsByRoleId;
    role: RoleEntity;
  }) {
    if (
      fieldPermission.canUpdateFieldRecords === true ||
      fieldPermission.canReadFieldRecords === true
    ) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ONLY_FIELD_RESTRICTION_ALLOWED,
        PermissionsExceptionCode.ONLY_FIELD_RESTRICTION_ALLOWED,
      );
    }

    const objectMetadataForFieldPermission =
      objectMetadataMapsById[fieldPermission.objectMetadataId];

    if (!isDefined(objectMetadataForFieldPermission)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.OBJECT_METADATA_NOT_FOUND,
        PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    if (objectMetadataForFieldPermission.isSystem === true) {
      throw new PermissionsException(
        PermissionsExceptionMessage.CANNOT_ADD_FIELD_PERMISSION_ON_SYSTEM_OBJECT,
        PermissionsExceptionCode.CANNOT_ADD_FIELD_PERMISSION_ON_SYSTEM_OBJECT,
      );
    }

    const fieldMetadataForFieldPermission =
      objectMetadataForFieldPermission.fieldsById[
        fieldPermission.fieldMetadataId
      ];

    if (!isDefined(fieldMetadataForFieldPermission)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.FIELD_METADATA_NOT_FOUND,
        PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
      );
    }

    const rolePermissionOnObject =
      rolesPermissions?.[role.id]?.[fieldPermission.objectMetadataId];

    if (!isDefined(rolePermissionOnObject)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_NOT_FOUND,
        PermissionsExceptionCode.ROLE_NOT_FOUND,
      );
    }

    if (rolePermissionOnObject.canRead === false) {
      throw new PermissionsException(
        PermissionsExceptionMessage.FIELD_RESTRICTION_ONLY_ALLOWED_ON_READABLE_OBJECT,
        PermissionsExceptionCode.FIELD_RESTRICTION_ONLY_ALLOWED_ON_READABLE_OBJECT,
      );
    }

    if (
      rolePermissionOnObject.canUpdate === false &&
      fieldPermission.canUpdateFieldRecords === false
    ) {
      throw new PermissionsException(
        PermissionsExceptionMessage.FIELD_RESTRICTION_ON_UPDATE_ONLY_ALLOWED_ON_UPDATABLE_OBJECT,
        PermissionsExceptionCode.FIELD_RESTRICTION_ON_UPDATE_ONLY_ALLOWED_ON_UPDATABLE_OBJECT,
      );
    }
  }

  private async getRoleOrThrow({
    roleId,
    workspaceId,
  }: {
    roleId: string;
    workspaceId: string;
  }) {
    const role = await this.roleRepository.findOne({
      where: {
        id: roleId,
        workspaceId,
      },
      relations: ['objectPermissions', 'fieldPermissions'],
    });

    if (!isDefined(role)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_NOT_FOUND,
        PermissionsExceptionCode.ROLE_NOT_FOUND,
      );
    }

    return role;
  }

  private async validateRoleIsEditableOrThrow({ role }: { role: RoleEntity }) {
    if (!role.isEditable) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_NOT_EDITABLE,
        PermissionsExceptionCode.ROLE_NOT_EDITABLE,
      );
    }
  }
}
