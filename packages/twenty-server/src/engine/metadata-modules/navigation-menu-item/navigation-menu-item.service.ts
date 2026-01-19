import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { fromCreateNavigationMenuItemInputToFlatNavigationMenuItemToCreate } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/from-create-navigation-menu-item-input-to-flat-navigation-menu-item-to-create.util';
import { fromDeleteNavigationMenuItemInputToFlatNavigationMenuItemOrThrow } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/from-delete-navigation-menu-item-input-to-flat-navigation-menu-item-or-throw.util';
import { fromFlatNavigationMenuItemToNavigationMenuItemDto } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/from-flat-navigation-menu-item-to-navigation-menu-item-dto.util';
import { fromUpdateNavigationMenuItemInputToFlatNavigationMenuItemToUpdateOrThrow } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/from-update-navigation-menu-item-input-to-flat-navigation-menu-item-to-update-or-throw.util';
import { type CreateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/create-navigation-menu-item.input';
import { type NavigationMenuItemDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/navigation-menu-item.dto';
import { type UpdateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/update-navigation-menu-item.input';
import {
    NavigationMenuItemException,
    NavigationMenuItemExceptionCode,
} from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class NavigationMenuItemService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async findAll(workspaceId: string): Promise<NavigationMenuItemDTO[]> {
    const { flatNavigationMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatNavigationMenuItemMaps'],
        },
      );

    return Object.values(flatNavigationMenuItemMaps.byId)
      .filter(isDefined)
      .sort((a, b) => a.position - b.position)
      .map(fromFlatNavigationMenuItemToNavigationMenuItemDto);
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<NavigationMenuItemDTO | null> {
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

  async findByIdOrThrow(
    id: string,
    workspaceId: string,
  ): Promise<NavigationMenuItemDTO> {
    const navigationMenuItem = await this.findById(id, workspaceId);

    if (!isDefined(navigationMenuItem)) {
      throw new NavigationMenuItemException(
        'Navigation menu item not found',
        NavigationMenuItemExceptionCode.NAVIGATION_MENU_ITEM_NOT_FOUND,
      );
    }

    return navigationMenuItem;
  }

  async create(
    input: CreateNavigationMenuItemInput,
    workspaceId: string,
  ): Promise<NavigationMenuItemDTO> {
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

    const flatNavigationMenuItemToCreate =
      fromCreateNavigationMenuItemInputToFlatNavigationMenuItemToCreate({
        createNavigationMenuItemInput: input,
        workspaceId,
        applicationId: workspaceCustomFlatApplication.id,
        flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps,
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
        },
      );

    if (isDefined(validateAndBuildResult)) {
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

  async update(
    input: UpdateNavigationMenuItemInput,
    workspaceId: string,
  ): Promise<NavigationMenuItemDTO> {
    const { flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatNavigationMenuItemMaps'],
        },
      );

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
        },
      );

    if (isDefined(validateAndBuildResult)) {
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

  async delete(id: string, workspaceId: string): Promise<NavigationMenuItemDTO> {
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
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting navigation menu item',
      );
    }

    return fromFlatNavigationMenuItemToNavigationMenuItemDto(
      flatNavigationMenuItemToDelete,
    );
  }
}
