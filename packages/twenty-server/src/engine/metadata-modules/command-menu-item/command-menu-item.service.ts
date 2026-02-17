import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import {
  CommandMenuItemException,
  CommandMenuItemExceptionCode,
} from 'src/engine/metadata-modules/command-menu-item/command-menu-item.exception';
import { type CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';
import { type CreateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/create-command-menu-item.input';
import { type UpdateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/update-command-menu-item.input';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { fromCreateCommandMenuItemInputToFlatCommandMenuItemToCreate } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-create-command-menu-item-input-to-flat-command-menu-item-to-create.util';
import { fromDeleteCommandMenuItemInputToFlatCommandMenuItemOrThrow } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-delete-command-menu-item-input-to-flat-command-menu-item-or-throw.util';
import { fromFlatCommandMenuItemToCommandMenuItemDto } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-flat-command-menu-item-to-command-menu-item-dto.util';
import { fromUpdateCommandMenuItemInputToFlatCommandMenuItemToUpdateOrThrow } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-update-command-menu-item-input-to-flat-command-menu-item-to-update-or-throw.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class CommandMenuItemService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async findAll(workspaceId: string): Promise<CommandMenuItemDTO[]> {
    const { flatCommandMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatCommandMenuItemMaps'],
        },
      );

    return Object.values(flatCommandMenuItemMaps.byUniversalIdentifier)
      .filter(isDefined)
      .sort((a, b) => a.label.localeCompare(b.label))
      .map(fromFlatCommandMenuItemToCommandMenuItemDto);
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<CommandMenuItemDTO | null> {
    const { flatCommandMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatCommandMenuItemMaps'],
        },
      );

    const flatCommandMenuItem = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatCommandMenuItemMaps,
    });

    if (!isDefined(flatCommandMenuItem)) {
      return null;
    }

    return fromFlatCommandMenuItemToCommandMenuItemDto(flatCommandMenuItem);
  }

  async findByIdOrThrow(
    id: string,
    workspaceId: string,
  ): Promise<CommandMenuItemDTO> {
    const commandMenuItem = await this.findById(id, workspaceId);

    if (!isDefined(commandMenuItem)) {
      throw new CommandMenuItemException(
        'Command menu item not found',
        CommandMenuItemExceptionCode.COMMAND_MENU_ITEM_NOT_FOUND,
      );
    }

    return commandMenuItem;
  }

  async create(
    input: CreateCommandMenuItemInput,
    workspaceId: string,
  ): Promise<CommandMenuItemDTO> {
    const { flatObjectMetadataMaps, flatFrontComponentMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFrontComponentMaps'],
        },
      );

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatCommandMenuItemToCreate =
      fromCreateCommandMenuItemInputToFlatCommandMenuItemToCreate({
        createCommandMenuItemInput: input,
        workspaceId,
        flatApplication: workspaceCustomFlatApplication,
        flatObjectMetadataMaps,
        flatFrontComponentMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [flatCommandMenuItemToCreate],
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
        'Multiple validation errors occurred while creating command menu item',
      );
    }

    const { flatCommandMenuItemMaps: recomputedFlatCommandMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatCommandMenuItemMaps'],
        },
      );

    return fromFlatCommandMenuItemToCommandMenuItemDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatCommandMenuItemToCreate.id,
        flatEntityMaps: recomputedFlatCommandMenuItemMaps,
      }),
    );
  }

  async update(
    input: UpdateCommandMenuItemInput,
    workspaceId: string,
  ): Promise<CommandMenuItemDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      flatCommandMenuItemMaps: existingFlatCommandMenuItemMaps,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatCommandMenuItemMaps', 'flatObjectMetadataMaps'],
        },
      );

    const flatCommandMenuItemToUpdate =
      fromUpdateCommandMenuItemInputToFlatCommandMenuItemToUpdateOrThrow({
        flatCommandMenuItemMaps: existingFlatCommandMenuItemMaps,
        updateCommandMenuItemInput: input,
        flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatCommandMenuItemToUpdate],
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
        'Multiple validation errors occurred while updating command menu item',
      );
    }

    const { flatCommandMenuItemMaps: recomputedFlatCommandMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatCommandMenuItemMaps'],
        },
      );

    return fromFlatCommandMenuItemToCommandMenuItemDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: input.id,
        flatEntityMaps: recomputedFlatCommandMenuItemMaps,
      }),
    );
  }

  async delete(id: string, workspaceId: string): Promise<CommandMenuItemDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatCommandMenuItemMaps: existingFlatCommandMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatCommandMenuItemMaps'],
        },
      );

    const flatCommandMenuItemToDelete =
      fromDeleteCommandMenuItemInputToFlatCommandMenuItemOrThrow({
        flatCommandMenuItemMaps: existingFlatCommandMenuItemMaps,
        commandMenuItemId: id,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [flatCommandMenuItemToDelete],
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
        'Multiple validation errors occurred while deleting command menu item',
      );
    }

    return fromFlatCommandMenuItemToCommandMenuItemDto(
      flatCommandMenuItemToDelete,
    );
  }

  async findAllFlatCommandMenuItems(
    workspaceId: string,
  ): Promise<FlatCommandMenuItem[]> {
    const { flatCommandMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatCommandMenuItemMaps'],
        },
      );

    return Object.values(flatCommandMenuItemMaps.byUniversalIdentifier)
      .filter(isDefined)
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  async findByWorkflowVersionId(
    workflowVersionId: string,
    workspaceId: string,
  ): Promise<CommandMenuItemDTO | null> {
    const { flatCommandMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatCommandMenuItemMaps'],
        },
      );

    const flatCommandMenuItem = Object.values(
      flatCommandMenuItemMaps.byUniversalIdentifier,
    ).find(
      (item) => isDefined(item) && item.workflowVersionId === workflowVersionId,
    );

    if (!isDefined(flatCommandMenuItem)) {
      return null;
    }

    return fromFlatCommandMenuItemToCommandMenuItemDto(flatCommandMenuItem);
  }
}
