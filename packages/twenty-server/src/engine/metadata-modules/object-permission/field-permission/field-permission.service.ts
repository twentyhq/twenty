import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ObjectRecordsPermissionsByRoleId } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isFieldMetadataTypeRelation } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-type-relation.util';
import { UpsertFieldPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-field-permissions.input';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class FieldPermissionService {
  constructor(
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(FieldMetadataEntity, 'core')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
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

    const existingFieldPermissions = await this.fieldPermissionsRepository.find(
      {
        where: {
          roleId: input.roleId,
          workspaceId,
        },
      },
    );

    const fieldPermissionsToDeleteIds: string[] = [];

    input.fieldPermissions.forEach((fieldPermission) => {
      this.validateFieldPermission({
        fieldPermission,
        objectMetadataMapsById,
        rolesPermissions,
        role,
      });

      if (
        fieldPermission.canReadFieldValue === null ||
        fieldPermission.canUpdateFieldValue === null
      ) {
        this.checkIfFieldPermissionShouldBeDeleted({
          fieldPermission,
          existingFieldPermissions,
          fieldPermissionsToDeleteIds,
        });
      }
    });

    const fieldPermissions = input.fieldPermissions.map((fieldPermission) => ({
      ...fieldPermission,
      roleId: input.roleId,
      workspaceId,
    }));

    const existingFieldPermissionsToDelete = existingFieldPermissions.filter(
      (existingFieldPermissionToFilter) =>
        fieldPermissionsToDeleteIds.includes(
          existingFieldPermissionToFilter.id,
        ),
    );

    const fieldPermissionsToUpsert = fieldPermissions.filter(
      (fieldPermissionToUpsert) =>
        !existingFieldPermissionsToDelete.some(
          (existingFieldPermissionToDelete) =>
            existingFieldPermissionToDelete.fieldMetadataId ===
            fieldPermissionToUpsert.fieldMetadataId,
        ),
    );

    const fieldMetadatasForFieldPermissions =
      await this.fieldMetadataRepository.find({
        where: {
          id: In(fieldPermissions.map((fp) => fp.fieldMetadataId)),
        },
      });

    const relatedFieldPermissionsToUpsert =
      this.computeFieldPermissionForRelationTargetFieldMetadata({
        fieldPermissions: fieldPermissionsToUpsert,
        fieldMetadatasForFieldPermissions,
      });

    await this.fieldPermissionsRepository.upsert(
      [...fieldPermissionsToUpsert, ...relatedFieldPermissionsToUpsert],
      {
        conflictPaths: ['fieldMetadataId', 'roleId'],
      },
    );

    if (fieldPermissionsToDeleteIds.length > 0) {
      const relatedFieldPermissionToDeleteIds =
        this.getRelatedFieldPermissionsToDeleteIds({
          allFieldPermissions: existingFieldPermissions,
          fieldPermissionsToDelete: existingFieldPermissionsToDelete,
          fieldMetadatas: fieldMetadatasForFieldPermissions,
        });

      await this.fieldPermissionsRepository.delete({
        id: In([
          ...fieldPermissionsToDeleteIds,
          ...relatedFieldPermissionToDeleteIds,
        ]),
      });
    }

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
        workspaceId,
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
    objectMetadataMapsById: ObjectMetadataMaps['byId'];
    rolesPermissions: ObjectRecordsPermissionsByRoleId;
    role: RoleEntity;
  }) {
    if (
      ('canUpdateFieldValue' in fieldPermission &&
        fieldPermission.canUpdateFieldValue !== null &&
        fieldPermission.canUpdateFieldValue !== false) ||
      ('canReadFieldValue' in fieldPermission &&
        fieldPermission.canReadFieldValue !== null &&
        fieldPermission.canReadFieldValue !== false)
    ) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ONLY_FIELD_RESTRICTION_ALLOWED,
        PermissionsExceptionCode.ONLY_FIELD_RESTRICTION_ALLOWED,
        {
          userFriendlyMessage:
            'Field permissions can only be used to restrict access, not to grant additional permissions.',
        },
      );
    }

    const objectMetadataForFieldPermission =
      objectMetadataMapsById[fieldPermission.objectMetadataId];

    if (!isDefined(objectMetadataForFieldPermission)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.OBJECT_METADATA_NOT_FOUND,
        PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
        {
          userFriendlyMessage:
            'The object you are trying to set permissions for could not be found. It may have been deleted.',
        },
      );
    }

    if (objectMetadataForFieldPermission.isSystem === true) {
      throw new PermissionsException(
        PermissionsExceptionMessage.CANNOT_ADD_FIELD_PERMISSION_ON_SYSTEM_OBJECT,
        PermissionsExceptionCode.CANNOT_ADD_FIELD_PERMISSION_ON_SYSTEM_OBJECT,
        {
          userFriendlyMessage:
            'You cannot set field permissions on system objects as they are managed by the platform.',
        },
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
        {
          userFriendlyMessage:
            'The field you are trying to set permissions for could not be found. It may have been deleted.',
        },
      );
    }

    const rolePermissionOnObject =
      rolesPermissions?.[role.id]?.[fieldPermission.objectMetadataId];

    if (!isDefined(rolePermissionOnObject)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.OBJECT_PERMISSION_NOT_FOUND,
        PermissionsExceptionCode.OBJECT_PERMISSION_NOT_FOUND,
        {
          userFriendlyMessage:
            'No permissions are set for this role on the selected object. Please set object permissions first.',
        },
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
        {
          userFriendlyMessage:
            'The role you are trying to modify could not be found. It may have been deleted or you may not have access to it.',
        },
      );
    }

    return role;
  }

  private async validateRoleIsEditableOrThrow({ role }: { role: RoleEntity }) {
    if (!role.isEditable) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_NOT_EDITABLE,
        PermissionsExceptionCode.ROLE_NOT_EDITABLE,
        {
          userFriendlyMessage:
            'This role cannot be modified because it is a system role. Only custom roles can be edited.',
        },
      );
    }
  }

  private checkIfFieldPermissionShouldBeDeleted({
    fieldPermission,
    existingFieldPermissions,
    fieldPermissionsToDeleteIds,
  }: {
    fieldPermission: UpsertFieldPermissionsInput['fieldPermissions'][0];
    existingFieldPermissions: FieldPermissionEntity[];
    fieldPermissionsToDeleteIds: string[];
  }) {
    const existingFieldPermission = existingFieldPermissions.find(
      (existingFieldPermission) =>
        existingFieldPermission.fieldMetadataId ===
        fieldPermission.fieldMetadataId,
    );

    if (existingFieldPermission) {
      const finalCanReadFieldValue =
        'canReadFieldValue' in fieldPermission
          ? fieldPermission.canReadFieldValue
          : existingFieldPermission.canReadFieldValue;
      const finalCanUpdateFieldValue =
        'canUpdateFieldValue' in fieldPermission
          ? fieldPermission.canUpdateFieldValue
          : existingFieldPermission.canUpdateFieldValue;

      if (
        finalCanReadFieldValue === null &&
        finalCanUpdateFieldValue === null
      ) {
        fieldPermissionsToDeleteIds.push(existingFieldPermission.id);
      }
    }
  }

  private getRelatedFieldPermissionsToDeleteIds({
    allFieldPermissions,
    fieldPermissionsToDelete,
    fieldMetadatas,
  }: {
    allFieldPermissions: FieldPermissionEntity[];
    fieldPermissionsToDelete: FieldPermissionEntity[];
    fieldMetadatas: FieldMetadataEntity[];
  }) {
    const fieldMetadatasForFieldPermissionsToDelete = fieldMetadatas.filter(
      (fieldMetadata) =>
        fieldPermissionsToDelete.some(
          (existingFieldPermissionToDelete) =>
            existingFieldPermissionToDelete.fieldMetadataId ===
            fieldMetadata.id,
        ),
    );

    const relationTargetFieldMetadataIds: string[] = [];

    for (const fieldMetadataForFieldPermissionToDelete of fieldMetadatasForFieldPermissionsToDelete) {
      if (
        isFieldMetadataTypeRelation(fieldMetadataForFieldPermissionToDelete)
      ) {
        if (
          fieldMetadataForFieldPermissionToDelete.settings?.relationType ===
            RelationType.ONE_TO_MANY ||
          fieldMetadataForFieldPermissionToDelete.settings?.relationType ===
            RelationType.MANY_TO_ONE
        ) {
          relationTargetFieldMetadataIds.push(
            fieldMetadataForFieldPermissionToDelete.relationTargetFieldMetadataId,
          );
        }
      }
    }

    const fieldPermissionsForRelationTargetFieldMetadataIds =
      allFieldPermissions
        .filter((fieldPermission) =>
          relationTargetFieldMetadataIds.includes(
            fieldPermission.fieldMetadataId,
          ),
        )
        .map((fieldPermission) => fieldPermission.id);

    return fieldPermissionsForRelationTargetFieldMetadataIds;
  }

  private computeFieldPermissionForRelationTargetFieldMetadata({
    fieldPermissions,
    fieldMetadatasForFieldPermissions,
  }: {
    fieldPermissions: UpsertFieldPermissionsInput['fieldPermissions'];
    fieldMetadatasForFieldPermissions: FieldMetadataEntity[];
  }) {
    return fieldPermissions
      .map((fieldPermission) => {
        const fieldMetadata = fieldMetadatasForFieldPermissions.find(
          (fm) => fm.id === fieldPermission.fieldMetadataId,
        );

        if (!isDefined(fieldMetadata)) {
          throw new InternalServerError(
            'Field metadata not found for field permission',
          );
        }

        if (isFieldMetadataTypeRelation(fieldMetadata)) {
          if (
            fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY ||
            fieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE
          ) {
            const fieldPermissionInputHasFieldPermissionOnRelationTargetFieldMetadata =
              fieldPermissions.filter(
                (fieldPermissionInput) =>
                  fieldPermissionInput.fieldMetadataId ===
                  fieldMetadata.relationTargetFieldMetadataId,
              ).length > 0;

            if (
              fieldPermissionInputHasFieldPermissionOnRelationTargetFieldMetadata
            ) {
              return;
            }

            return {
              ...fieldPermission,
              objectMetadataId: fieldMetadata.relationTargetObjectMetadataId,
              fieldMetadataId: fieldMetadata.relationTargetFieldMetadataId,
            };
          }
        }

        return null;
      })
      .filter(isDefined);
  }
}
