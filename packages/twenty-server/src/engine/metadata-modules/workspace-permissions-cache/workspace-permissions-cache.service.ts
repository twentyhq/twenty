import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Record } from 'cloudflare/core';
import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Not, Repository } from 'typeorm';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserWorkspaceRoleMap } from 'src/engine/metadata-modules/workspace-permissions-cache/types/user-workspace-role-map.type';
import { WorkspacePermissionsCacheStorageService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache-storage.service';
import { TwentyORMExceptionCode } from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { GetDataFromCacheWithRecomputeService } from 'src/engine/workspace-cache-storage/services/get-data-from-cache-with-recompute.service';

type CacheResult<T, U> = {
  version: T;
  data: U;
};

export const USER_WORKSPACE_ROLE_MAP = 'User workspace role map';
export const ROLES_PERMISSIONS = 'Roles permissions';
const WORKFLOW_STANDARD_OBJECT_IDS = [
  STANDARD_OBJECT_IDS.workflow,
  STANDARD_OBJECT_IDS.workflowRun,
  STANDARD_OBJECT_IDS.workflowVersion,
] as const;

@Injectable()
export class WorkspacePermissionsCacheService {
  logger = new Logger(WorkspacePermissionsCacheService.name);

  constructor(
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(RoleTargetsEntity)
    private readonly roleTargetsRepository: Repository<RoleTargetsEntity>,
    private readonly workspacePermissionsCacheStorageService: WorkspacePermissionsCacheStorageService,
    private readonly getRolesPermissionsFromCacheWithRecomputeService: GetDataFromCacheWithRecomputeService<
      string,
      ObjectsPermissionsByRoleId
    >,
    private readonly getUserWorkspaceRoleMapFromCacheWithRecomputeService: GetDataFromCacheWithRecomputeService<
      string,
      UserWorkspaceRoleMap
    >,
    private readonly getApiKeyRoleMapFromCacheWithRecomputeService: GetDataFromCacheWithRecomputeService<
      string,
      Record<string, string>
    >,
  ) {}

  async recomputeRolesPermissionsCache({
    workspaceId,
    roleIds,
  }: {
    workspaceId: string;
    roleIds?: string[];
  }): Promise<void> {
    let currentRolesPermissions: ObjectsPermissionsByRoleId | undefined;

    if (roleIds) {
      currentRolesPermissions =
        await this.workspacePermissionsCacheStorageService.getRolesPermissions(
          workspaceId,
        );
    }

    const recomputedRolesPermissions =
      await this.getObjectRecordPermissionsForRoles({
        workspaceId,
        roleIds,
      });

    const freshObjectRecordsPermissionsByRoleId = roleIds
      ? { ...currentRolesPermissions, ...recomputedRolesPermissions }
      : recomputedRolesPermissions;

    await this.workspacePermissionsCacheStorageService.setRolesPermissions(
      workspaceId,
      freshObjectRecordsPermissionsByRoleId,
    );
  }

  async recomputeUserWorkspaceRoleMapCache({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    try {
      const freshUserWorkspaceRoleMap =
        await this.getUserWorkspaceRoleMapFromDatabase({
          workspaceId,
        });

      await this.workspacePermissionsCacheStorageService.setUserWorkspaceRoleMap(
        workspaceId,
        freshUserWorkspaceRoleMap,
      );
      await this.workspacePermissionsCacheStorageService.setUserWorkspaceRoleMapVersion(
        workspaceId,
      );
    } catch {
      // Flush stale userWorkspaceRoleMap
      await this.workspacePermissionsCacheStorageService.removeUserWorkspaceRoleMap(
        workspaceId,
      );
    }
  }

  async getRolesPermissionsFromCache({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<CacheResult<string, ObjectsPermissionsByRoleId>> {
    return this.getRolesPermissionsFromCacheWithRecomputeService.getFromCacheWithRecompute(
      {
        workspaceId,
        getCacheData: () =>
          this.workspacePermissionsCacheStorageService.getRolesPermissions(
            workspaceId,
          ),
        getCacheVersion: () =>
          this.workspacePermissionsCacheStorageService.getRolesPermissionsVersion(
            workspaceId,
          ),
        recomputeCache: (params) => this.recomputeRolesPermissionsCache(params),
        cachedEntityName: ROLES_PERMISSIONS,
        exceptionCode:
          TwentyORMExceptionCode.ROLES_PERMISSIONS_VERSION_NOT_FOUND,
      },
    );
  }

  async getUserWorkspaceRoleMapFromCache({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<CacheResult<string, UserWorkspaceRoleMap>> {
    return this.getUserWorkspaceRoleMapFromCacheWithRecomputeService.getFromCacheWithRecompute(
      {
        workspaceId,
        getCacheData: () =>
          this.workspacePermissionsCacheStorageService.getUserWorkspaceRoleMap(
            workspaceId,
          ),
        getCacheVersion: () =>
          this.workspacePermissionsCacheStorageService.getUserWorkspaceRoleMapVersion(
            workspaceId,
          ),
        recomputeCache: (params) =>
          this.recomputeUserWorkspaceRoleMapCache(params),
        cachedEntityName: USER_WORKSPACE_ROLE_MAP,
        exceptionCode:
          TwentyORMExceptionCode.USER_WORKSPACE_ROLE_MAP_VERSION_NOT_FOUND,
      },
    );
  }

  async getRoleIdFromUserWorkspaceId({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
  }): Promise<string | undefined> {
    if (!isDefined(userWorkspaceId)) {
      return;
    }

    const { data: userWorkspaceRoleMap } =
      await this.getUserWorkspaceRoleMapFromCache({
        workspaceId,
      });

    return userWorkspaceRoleMap[userWorkspaceId];
  }

  async getObjectRecordPermissionsForRoles({
    workspaceId,
    roleIds,
  }: {
    workspaceId: string;
    roleIds?: string[];
  }): Promise<ObjectsPermissionsByRoleId> {
    let roles: RoleEntity[] = [];

    roles = await this.roleRepository.find({
      where: {
        workspaceId,
        ...(roleIds ? { id: In(roleIds) } : {}),
      },
      relations: ['objectPermissions', 'permissionFlags', 'fieldPermissions'],
    });

    const workspaceObjectMetadataCollection =
      await this.getWorkspaceObjectMetadataCollection(workspaceId);

    const permissionsByRoleId: ObjectsPermissionsByRoleId = {};

    for (const role of roles) {
      const objectRecordsPermissions: ObjectsPermissions = {};

      for (const objectMetadata of workspaceObjectMetadataCollection) {
        const { id: objectMetadataId, isSystem, standardId } = objectMetadata;

        let canRead = role.canReadAllObjectRecords;
        let canUpdate = role.canUpdateAllObjectRecords;
        let canSoftDelete = role.canSoftDeleteAllObjectRecords;
        let canDestroy = role.canDestroyAllObjectRecords;
        const restrictedFields: RestrictedFieldsPermissions = {};

        if (
          standardId &&
          WORKFLOW_STANDARD_OBJECT_IDS.includes(
            standardId as (typeof WORKFLOW_STANDARD_OBJECT_IDS)[number],
          )
        ) {
          const hasWorkflowsPermissions = this.hasWorkflowsPermissions(role);

          canRead = hasWorkflowsPermissions;
          canUpdate = hasWorkflowsPermissions;
          canSoftDelete = hasWorkflowsPermissions;
          canDestroy = hasWorkflowsPermissions;
        } else {
          const objectRecordPermissionsOverride = role.objectPermissions.find(
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

          const fieldPermissions = role.fieldPermissions.filter(
            (fieldPermission) =>
              fieldPermission.objectMetadataId === objectMetadataId,
          );

          for (const fieldPermission of fieldPermissions) {
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
        };

        permissionsByRoleId[role.id] = objectRecordsPermissions;
      }
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
        'standardId',
        'labelIdentifierFieldMetadataId',
      ],
    });

    return workspaceObjectMetadata;
  }

  private async getUserWorkspaceRoleMapFromDatabase({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<UserWorkspaceRoleMap> {
    const roleTargetsMap = await this.roleTargetsRepository.find({
      where: {
        workspaceId,
        userWorkspaceId: Not(IsNull()),
      },
    });

    return roleTargetsMap.reduce((acc, roleTarget) => {
      acc[roleTarget.userWorkspaceId] = roleTarget.roleId;

      return acc;
    }, {} as UserWorkspaceRoleMap);
  }

  private hasWorkflowsPermissions(role: RoleEntity): boolean {
    const hasWorkflowsPermissionFromRole = role.canUpdateAllSettings;
    const hasWorkflowsPermissionsFromSettingPermissions = isDefined(
      role.permissionFlags.find(
        (permissionFlag) =>
          permissionFlag.flag === PermissionFlagType.WORKFLOWS,
      ),
    );

    return (
      hasWorkflowsPermissionFromRole ||
      hasWorkflowsPermissionsFromSettingPermissions
    );
  }

  async recomputeApiKeyRoleMapCache({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    try {
      const freshApiKeyRoleMap = await this.getApiKeyRoleMapFromDatabase({
        workspaceId,
      });

      await this.workspacePermissionsCacheStorageService.setApiKeyRoleMap(
        workspaceId,
        freshApiKeyRoleMap,
      );
    } catch {
      // Flush stale apiKeyRoleMap
      await this.workspacePermissionsCacheStorageService.removeApiKeyRoleMap(
        workspaceId,
      );
    }
  }

  async getApiKeyRoleMapFromCache({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<CacheResult<string, Record<string, string>>> {
    return this.getApiKeyRoleMapFromCacheWithRecomputeService.getFromCacheWithRecompute(
      {
        workspaceId,
        getCacheData: () =>
          this.workspacePermissionsCacheStorageService.getApiKeyRoleMap(
            workspaceId,
          ),
        getCacheVersion: () =>
          this.workspacePermissionsCacheStorageService.getApiKeyRoleMapVersion(
            workspaceId,
          ),
        recomputeCache: (params) => this.recomputeApiKeyRoleMapCache(params),
        cachedEntityName: 'API_KEY_ROLE_MAP',
        exceptionCode:
          TwentyORMExceptionCode.API_KEY_ROLE_MAP_VERSION_NOT_FOUND,
      },
    );
  }

  private async getApiKeyRoleMapFromDatabase({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<Record<string, string>> {
    const roleTargetsMap = await this.roleTargetsRepository.find({
      where: {
        workspaceId,
        apiKeyId: Not(IsNull()),
      },
    });

    return roleTargetsMap.reduce(
      (acc, roleTarget) => {
        if (roleTarget.apiKeyId) {
          acc[roleTarget.apiKeyId] = roleTarget.roleId;
        }

        return acc;
      },
      {} as Record<string, string>,
    );
  }
}
