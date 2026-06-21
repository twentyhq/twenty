import { Injectable } from '@nestjs/common';

import type DataLoader from 'dataloader';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import {
  type ObjectMetadataLoaderPayload,
  type StandardApplicationIdLoaderPayload,
} from 'src/engine/dataloaders/dataloader.service';
import {
  CommandMenuItemException,
  CommandMenuItemExceptionCode,
} from 'src/engine/metadata-modules/command-menu-item/command-menu-item.exception';
import { type CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';
import { type CreateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/create-command-menu-item.input';
import { type UpdateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/update-command-menu-item.input';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { interpolateNavigationCommandMenuItemField } from 'src/engine/metadata-modules/command-menu-item/utils/interpolate-navigation-command-menu-item-field.util';
import { isObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/utils/is-object-metadata-command-menu-item-payload.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { fromCreateCommandMenuItemInputToFlatCommandMenuItemToCreate } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-create-command-menu-item-input-to-flat-command-menu-item-to-create.util';
import { fromDeleteCommandMenuItemInputToFlatCommandMenuItemOrThrow } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-delete-command-menu-item-input-to-flat-command-menu-item-or-throw.util';
import { fromFlatCommandMenuItemToCommandMenuItemDto } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-flat-command-menu-item-to-command-menu-item-dto.util';
import { fromUpdateCommandMenuItemInputToFlatCommandMenuItemToUpdateOrThrow } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-update-command-menu-item-input-to-flat-command-menu-item-to-update-or-throw.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/utils/is-caller-overriding-entity.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class CommandMenuItemService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly i18nService: I18nService,
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
      .sort((a, b) => a.position - b.position)
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
    const {
      flatObjectMetadataMaps,
      flatFrontComponentMaps,
      flatPageLayoutMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatObjectMetadataMaps',
            'flatFrontComponentMaps',
            'flatPageLayoutMaps',
          ],
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
        flatPageLayoutMaps,
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
      flatPageLayoutMaps: existingFlatPageLayoutMaps,
    } = await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatCommandMenuItemMaps',
          'flatObjectMetadataMaps',
          'flatPageLayoutMaps',
        ],
      },
    );

    const flatCommandMenuItemToUpdate =
      fromUpdateCommandMenuItemInputToFlatCommandMenuItemToUpdateOrThrow({
        flatCommandMenuItemMaps: existingFlatCommandMenuItemMaps,
        updateCommandMenuItemInput: input,
        flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
        flatPageLayoutMaps: existingFlatPageLayoutMaps,
        callerApplicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        workspaceCustomApplicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
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

  async reset(id: string, workspaceId: string): Promise<CommandMenuItemDTO> {
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

    const existingFlatCommandMenuItem = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: existingFlatCommandMenuItemMaps,
    });

    if (!isDefined(existingFlatCommandMenuItem)) {
      throw new CommandMenuItemException(
        'Command menu item not found',
        CommandMenuItemExceptionCode.COMMAND_MENU_ITEM_NOT_FOUND,
      );
    }

    if (
      existingFlatCommandMenuItem.applicationUniversalIdentifier ===
      workspaceCustomFlatApplication.universalIdentifier
    ) {
      throw new CommandMenuItemException(
        'Custom command menu item cannot be reset to default',
        CommandMenuItemExceptionCode.COMMAND_MENU_ITEM_CANNOT_BE_RESET,
      );
    }

    const flatCommandMenuItemToUpdate: FlatCommandMenuItem = {
      ...existingFlatCommandMenuItem,
      isActive: true,
      overrides: null,
      universalOverrides: null,
      updatedAt: new Date().toISOString(),
    };

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
        'Multiple validation errors occurred while resetting command menu item to default',
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
        flatEntityId: id,
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

    const shouldDeactivate = isCallerOverridingEntity({
      callerApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      entityApplicationUniversalIdentifier:
        flatCommandMenuItemToDelete.applicationUniversalIdentifier,
      workspaceCustomApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      isSystemSideEffect: flatCommandMenuItemToDelete.isSystemSideEffect,
    });

    const deactivatedFlatCommandMenuItem = {
      ...flatCommandMenuItemToDelete,
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: shouldDeactivate
                ? []
                : [flatCommandMenuItemToDelete],
              flatEntityToUpdate: shouldDeactivate
                ? [deactivatedFlatCommandMenuItem]
                : [],
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
      shouldDeactivate
        ? deactivatedFlatCommandMenuItem
        : flatCommandMenuItemToDelete,
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
      .sort((a, b) => a.position - b.position);
  }

  async loadNavigationObjectMetadata({
    commandMenuItem,
    objectMetadataLoader,
    workspaceId,
  }: {
    commandMenuItem: CommandMenuItemDTO;
    objectMetadataLoader: DataLoader<
      ObjectMetadataLoaderPayload,
      ObjectMetadataDTO | null
    >;
    workspaceId: string;
  }): Promise<ObjectMetadataDTO | null> {
    if (
      commandMenuItem.engineComponentKey !== EngineComponentKey.NAVIGATION ||
      !isObjectMetadataCommandMenuItemPayload(commandMenuItem.payload)
    ) {
      return null;
    }

    return objectMetadataLoader.load({
      objectMetadataId: commandMenuItem.payload.objectMetadataItemId,
      workspaceId,
    });
  }

  async resolveNavigationField({
    commandMenuItem,
    fieldName,
    objectMetadataLoader,
    standardApplicationIdLoader,
    workspaceId,
    locale,
  }: {
    commandMenuItem: CommandMenuItemDTO;
    fieldName: 'label' | 'shortLabel' | 'icon';
    objectMetadataLoader: DataLoader<
      ObjectMetadataLoaderPayload,
      ObjectMetadataDTO | null
    >;
    standardApplicationIdLoader: DataLoader<
      StandardApplicationIdLoaderPayload,
      string
    >;
    workspaceId: string;
    locale: keyof typeof APP_LOCALES | undefined;
  }): Promise<string | undefined> {
    const objectMetadata = await this.loadNavigationObjectMetadata({
      commandMenuItem,
      objectMetadataLoader,
      workspaceId,
    });

    const standardApplicationId = await standardApplicationIdLoader.load({
      workspaceId,
    });

    const isStandardApp = isDefined(objectMetadata)
      ? objectMetadata.applicationId === standardApplicationId
      : false;

    return interpolateNavigationCommandMenuItemField({
      commandMenuItem,
      fieldName,
      objectMetadata,
      isStandardApp,
      locale,
      i18nInstance: this.i18nService.getI18nInstance(locale ?? SOURCE_LOCALE),
    });
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
