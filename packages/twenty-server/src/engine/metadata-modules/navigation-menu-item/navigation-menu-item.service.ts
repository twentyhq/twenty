import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { getRecordImageIdentifier } from 'src/engine/core-modules/record-crud/utils/get-record-image-identifier.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { fromCreateNavigationMenuItemInputToFlatNavigationMenuItemToCreate } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/from-create-navigation-menu-item-input-to-flat-navigation-menu-item-to-create.util';
import { fromDeleteNavigationMenuItemInputToFlatNavigationMenuItemOrThrow } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/from-delete-navigation-menu-item-input-to-flat-navigation-menu-item-or-throw.util';
import { fromFlatNavigationMenuItemToNavigationMenuItemDto } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/from-flat-navigation-menu-item-to-navigation-menu-item-dto.util';
import { fromUpdateNavigationMenuItemInputToFlatNavigationMenuItemToUpdateOrThrow } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/from-update-navigation-menu-item-input-to-flat-navigation-menu-item-to-update-or-throw.util';
import { type CreateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/create-navigation-menu-item.input';
import { type NavigationMenuItemDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/navigation-menu-item.dto';
import { RecordIdentifierDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/record-identifier.dto';
import { type UpdateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/update-navigation-menu-item.input';
import {
  NavigationMenuItemException,
  NavigationMenuItemExceptionCode,
} from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { NavigationMenuItemAccessService } from 'src/engine/metadata-modules/navigation-menu-item/services/navigation-menu-item-access.service';
import { getMinimalSelectForRecordIdentifier } from 'src/engine/metadata-modules/navigation-menu-item/utils/get-minimal-select-for-record-identifier.util';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class NavigationMenuItemService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly navigationMenuItemAccessService: NavigationMenuItemAccessService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly fileService: FileService,
    private readonly userRoleService: UserRoleService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
  ) {}

  async findAll({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
  }): Promise<NavigationMenuItemDTO[]> {
    const { flatNavigationMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatNavigationMenuItemMaps'],
        },
      );

    return Object.values(flatNavigationMenuItemMaps.byUniversalIdentifier)
      .filter(
        (item): item is NonNullable<typeof item> =>
          isDefined(item) &&
          (!isDefined(item.userWorkspaceId) ||
            item.userWorkspaceId === userWorkspaceId),
      )
      .sort((a, b) => a.position - b.position)
      .map(fromFlatNavigationMenuItemToNavigationMenuItemDto);
  }

  async findById({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<NavigationMenuItemDTO | null> {
    const { flatNavigationMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatNavigationMenuItemMaps'],
        },
      );

    const flatNavigationMenuItem = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatNavigationMenuItemMaps,
    });

    if (!isDefined(flatNavigationMenuItem)) {
      return null;
    }

    return fromFlatNavigationMenuItemToNavigationMenuItemDto(
      flatNavigationMenuItem,
    );
  }

  async findByIdOrThrow({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<NavigationMenuItemDTO> {
    const navigationMenuItem = await this.findById({ id, workspaceId });

    if (!isDefined(navigationMenuItem)) {
      throw new NavigationMenuItemException(
        'Navigation menu item not found',
        NavigationMenuItemExceptionCode.NAVIGATION_MENU_ITEM_NOT_FOUND,
      );
    }

    return navigationMenuItem;
  }

  async create({
    input,
    workspaceId,
    authUserWorkspaceId,
    authApiKeyId,
    authApplicationId,
  }: {
    input: CreateNavigationMenuItemInput;
    workspaceId: string;
    authUserWorkspaceId?: string;
    authApiKeyId?: string;
    authApplicationId?: string;
  }): Promise<NavigationMenuItemDTO> {
    await this.navigationMenuItemAccessService.canUserCreateNavigationMenuItem({
      userWorkspaceId: authUserWorkspaceId,
      workspaceId,
      apiKeyId: authApiKeyId,
      applicationId: authApplicationId,
      inputUserWorkspaceId: input.userWorkspaceId,
    });
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps,
      flatObjectMetadataMaps,
      flatViewMaps,
    } = await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatNavigationMenuItemMaps',
          'flatObjectMetadataMaps',
          'flatViewMaps',
        ],
      },
    );

    const normalizedInput: CreateNavigationMenuItemInput = {
      ...input,
      userWorkspaceId:
        isDefined(input.userWorkspaceId) && isDefined(authUserWorkspaceId)
          ? authUserWorkspaceId
          : input.userWorkspaceId,
    };

    const flatNavigationMenuItemToCreate =
      fromCreateNavigationMenuItemInputToFlatNavigationMenuItemToCreate({
        createNavigationMenuItemInput: normalizedInput,
        workspaceId,
        flatApplication: workspaceCustomFlatApplication,
        flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps,
        flatObjectMetadataMaps,
        flatViewMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            navigationMenuItem: {
              flatEntityToCreate: [flatNavigationMenuItemToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating navigation menu item',
      );
    }

    const { flatNavigationMenuItemMaps: recomputedFlatNavigationMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatNavigationMenuItemMaps'],
        },
      );

    return fromFlatNavigationMenuItemToNavigationMenuItemDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatNavigationMenuItemToCreate.id,
        flatEntityMaps: recomputedFlatNavigationMenuItemMaps,
      }),
    );
  }

  async update({
    input,
    workspaceId,
    authUserWorkspaceId,
    authApiKeyId,
    authApplicationId,
  }: {
    input: UpdateNavigationMenuItemInput & { id: string };
    workspaceId: string;
    authUserWorkspaceId?: string;
    authApiKeyId?: string;
    authApplicationId?: string;
  }): Promise<NavigationMenuItemDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatNavigationMenuItemMaps'],
        },
      );

    const existingNavigationMenuItem = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: input.id,
      flatEntityMaps: existingFlatNavigationMenuItemMaps,
    });

    if (isDefined(existingNavigationMenuItem)) {
      await this.navigationMenuItemAccessService.canUserUpdateNavigationMenuItem(
        {
          userWorkspaceId: authUserWorkspaceId,
          workspaceId,
          apiKeyId: authApiKeyId,
          applicationId: authApplicationId,
          existingUserWorkspaceId: existingNavigationMenuItem.userWorkspaceId,
        },
      );
    }

    const flatNavigationMenuItemToUpdate =
      fromUpdateNavigationMenuItemInputToFlatNavigationMenuItemToUpdateOrThrow({
        flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps,
        updateNavigationMenuItemInput: input,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            navigationMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatNavigationMenuItemToUpdate],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating navigation menu item',
      );
    }

    const { flatNavigationMenuItemMaps: recomputedFlatNavigationMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatNavigationMenuItemMaps'],
        },
      );

    return fromFlatNavigationMenuItemToNavigationMenuItemDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: input.id,
        flatEntityMaps: recomputedFlatNavigationMenuItemMaps,
      }),
    );
  }

  async delete({
    id,
    workspaceId,
    authUserWorkspaceId,
    authApiKeyId,
    authApplicationId,
  }: {
    id: string;
    workspaceId: string;
    authUserWorkspaceId?: string;
    authApiKeyId?: string;
    authApplicationId?: string;
  }): Promise<NavigationMenuItemDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatNavigationMenuItemMaps'],
        },
      );

    const flatNavigationMenuItemToDelete =
      fromDeleteNavigationMenuItemInputToFlatNavigationMenuItemOrThrow({
        flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps,
        navigationMenuItemId: id,
      });

    await this.navigationMenuItemAccessService.canUserDeleteNavigationMenuItem({
      userWorkspaceId: authUserWorkspaceId,
      workspaceId,
      apiKeyId: authApiKeyId,
      applicationId: authApplicationId,
      existingUserWorkspaceId: flatNavigationMenuItemToDelete.userWorkspaceId,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            navigationMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [flatNavigationMenuItemToDelete],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting navigation menu item',
      );
    }

    return fromFlatNavigationMenuItemToNavigationMenuItemDto(
      flatNavigationMenuItemToDelete,
    );
  }

  private async getRoleId(
    authContext: WorkspaceAuthContext,
    workspaceId: string,
  ): Promise<string | undefined> {
    if (isApiKeyAuthContext(authContext)) {
      return this.apiKeyRoleService.getRoleIdForApiKeyId(
        authContext.apiKey.id,
        workspaceId,
      );
    }

    if (
      isApplicationAuthContext(authContext) &&
      isDefined(authContext.application.defaultRoleId)
    ) {
      return authContext.application.defaultRoleId;
    }

    if (isUserAuthContext(authContext)) {
      try {
        return await this.userRoleService.getRoleIdForUserWorkspace({
          userWorkspaceId: authContext.userWorkspaceId,
          workspaceId,
        });
      } catch (error: unknown) {
        if (error instanceof PermissionsException) {
          return undefined;
        }
        throw error;
      }
    }

    return undefined;
  }

  async findTargetRecord({
    targetRecordId,
    targetObjectMetadataId,
    workspaceId,
    authContext,
  }: {
    targetRecordId: string;
    targetObjectMetadataId: string;
    workspaceId: string;
    authContext: WorkspaceAuthContext;
  }): Promise<RecordIdentifierDTO | null> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: targetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(objectMetadata)) {
      return null;
    }

    try {
      const roleId = await this.getRoleId(authContext, workspaceId);

      if (!isDefined(roleId)) {
        return null;
      }

      const rolePermissionConfig: RolePermissionConfig = {
        unionOf: [roleId],
      };

      const minimalSelectColumns = getMinimalSelectForRecordIdentifier({
        flatObjectMetadata: objectMetadata,
        flatFieldMetadataMaps,
      });

      const record =
        await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
          async () => {
            const repository =
              await this.globalWorkspaceOrmManager.getRepository(
                workspaceId,
                objectMetadata.nameSingular,
                rolePermissionConfig,
              );

            const alias = objectMetadata.nameSingular;
            const queryBuilder = repository.createQueryBuilder(alias);

            queryBuilder.select([]);

            for (const column of minimalSelectColumns) {
              queryBuilder.addSelect(`"${alias}"."${column}"`, column);
            }

            const rawResult = await queryBuilder
              .where(`${alias}.id = :id`, { id: targetRecordId })
              .getRawOne();

            if (!isDefined(rawResult)) {
              return null;
            }

            const formattedRecord = formatResult<Record<string, unknown>>(
              rawResult,
              objectMetadata,
              flatObjectMetadataMaps,
              flatFieldMetadataMaps,
            );

            return formattedRecord;
          },
          authContext,
        );

      if (!isDefined(record)) {
        return null;
      }

      const labelIdentifier = getRecordDisplayName(
        record,
        objectMetadata,
        flatFieldMetadataMaps,
      );

      const imageIdentifier = getRecordImageIdentifier({
        record,
        flatObjectMetadata: objectMetadata,
        flatFieldMetadataMaps,
        signUrl: (url: string) =>
          this.fileService.signFileUrl({
            url,
            workspaceId,
          }),
      });

      return {
        id: record.id as string,
        labelIdentifier,
        imageIdentifier,
      };
    } catch (error: unknown) {
      if (error instanceof PermissionsException) {
        return null;
      }
      throw error;
    }
  }
}
