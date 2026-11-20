import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import type DataLoader from 'dataloader';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type ObjectMetadataLoaderPayload } from 'src/engine/dataloaders/dataloader.service';
import {
  CommandMenuItemException,
  CommandMenuItemExceptionCode,
} from 'src/engine/metadata-modules/command-menu-item/command-menu-item.exception';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { type CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-entity-property.util';
import { type CreateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/create-command-menu-item.input';
import { type UpdateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/update-command-menu-item.input';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { interpolateNavigationCommandMenuItemField } from 'src/engine/metadata-modules/command-menu-item/utils/interpolate-navigation-command-menu-item-field.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { fromCreateCommandMenuItemInputToFlatCommandMenuItemToCreate } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-create-command-menu-item-input-to-flat-command-menu-item-to-create.util';
import { fromDeleteCommandMenuItemInputToFlatCommandMenuItemOrThrow } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-delete-command-menu-item-input-to-flat-command-menu-item-or-throw.util';
import { fromFlatCommandMenuItemToCommandMenuItemDto } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-flat-command-menu-item-to-command-menu-item-dto.util';
import { fromUpdateCommandMenuItemInputToFlatCommandMenuItemToUpdateOrThrow } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-update-command-menu-item-input-to-flat-command-menu-item-to-update-or-throw.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/overrides/utils/is-caller-overriding-entity.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { dispatchIsActiveUpdateToAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/dispatch-is-active-update-to-authored-override.util';
import { resetAuthoredOverrides } from 'src/engine/metadata-modules/overrides/utils/reset-authored-overrides.util';

@Injectable()
export class CommandMenuItemService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
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
    const flatCommandMenuItemToCreate =
      await this.computeFlatCommandMenuItemToCreate({ input, workspaceId });

    await this.runCommandMenuItemMigration({
      workspaceId,
      operations: { flatEntityToCreate: [flatCommandMenuItemToCreate] },
      failureMessage:
        'Multiple validation errors occurred while creating command menu item',
    });

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

  async computeFlatCommandMenuItemToCreate({
    input,
    workspaceId,
  }: {
    input: CreateCommandMenuItemInput;
    workspaceId: string;
  }): Promise<FlatCommandMenuItem> {
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

    return fromCreateCommandMenuItemInputToFlatCommandMenuItemToCreate({
      createCommandMenuItemInput: input,
      workspaceId,
      flatApplication: workspaceCustomFlatApplication,
      flatObjectMetadataMaps,
      flatFrontComponentMaps,
      flatPageLayoutMaps,
    });
  }

  async update(
    input: UpdateCommandMenuItemInput,
    workspaceId: string,
  ): Promise<CommandMenuItemDTO> {
    const flatCommandMenuItemToUpdate =
      await this.computeFlatCommandMenuItemToUpdate({ input, workspaceId });

    await this.runCommandMenuItemMigration({
      workspaceId,
      operations: { flatEntityToUpdate: [flatCommandMenuItemToUpdate] },
      failureMessage:
        'Multiple validation errors occurred while updating command menu item',
    });

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

  async computeFlatCommandMenuItemToUpdate({
    input,
    workspaceId,
  }: {
    input: UpdateCommandMenuItemInput;
    workspaceId: string;
  }): Promise<FlatCommandMenuItem> {
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

    return fromUpdateCommandMenuItemInputToFlatCommandMenuItemToUpdateOrThrow({
      flatCommandMenuItemMaps: existingFlatCommandMenuItemMaps,
      updateCommandMenuItemInput: input,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      flatPageLayoutMaps: existingFlatPageLayoutMaps,
      callerApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      workspaceCustomApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    });
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
      ...resetAuthoredOverrides({
        metadataName: 'commandMenuItem',
        flatEntity: existingFlatCommandMenuItem,
        authorUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        workspaceCustomApplicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
      }),
      isActive: true,
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

  async activate(id: string, workspaceId: string): Promise<CommandMenuItemDTO> {
    const { flatCommandMenuItemMaps: existingFlatCommandMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatCommandMenuItemMaps'],
        },
      );

    const activatedFlatCommandMenuItem =
      await this.computeActivatedFlatCommandMenuItem({
        flatCommandMenuItem: findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: id,
          flatEntityMaps: existingFlatCommandMenuItemMaps,
        }),
        workspaceId,
      });

    await this.runCommandMenuItemMigration({
      workspaceId,
      operations: { flatEntityToUpdate: [activatedFlatCommandMenuItem] },
      failureMessage:
        'Multiple validation errors occurred while activating command menu item',
    });

    return fromFlatCommandMenuItemToCommandMenuItemDto(
      activatedFlatCommandMenuItem,
    );
  }

  async computeActivatedFlatCommandMenuItem({
    flatCommandMenuItem,
    workspaceId,
  }: {
    flatCommandMenuItem: FlatCommandMenuItem;
    workspaceId: string;
  }): Promise<FlatCommandMenuItem> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    return {
      ...dispatchIsActiveUpdateToAuthoredOverride({
        metadataName: 'commandMenuItem',
        flatEntity: flatCommandMenuItem,
        isActive: true,
        authorUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        workspaceCustomApplicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
      }),
      updatedAt: new Date().toISOString(),
    };
  }

  async delete(id: string, workspaceId: string): Promise<CommandMenuItemDTO> {
    const { flatCommandMenuItemToDelete, flatCommandMenuItemToDeactivate } =
      await this.computeFlatCommandMenuItemDeletion({ id, workspaceId });

    await this.runCommandMenuItemMigration({
      workspaceId,
      operations: isDefined(flatCommandMenuItemToDeactivate)
        ? { flatEntityToUpdate: [flatCommandMenuItemToDeactivate] }
        : { flatEntityToDelete: [flatCommandMenuItemToDelete] },
      failureMessage:
        'Multiple validation errors occurred while deleting command menu item',
    });

    return fromFlatCommandMenuItemToCommandMenuItemDto(
      flatCommandMenuItemToDeactivate ?? flatCommandMenuItemToDelete,
    );
  }

  async computeFlatCommandMenuItemDeletion({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<{
    flatCommandMenuItemToDelete: FlatCommandMenuItem;
    flatCommandMenuItemToDeactivate: FlatCommandMenuItem | undefined;
  }> {
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

    return {
      flatCommandMenuItemToDelete,
      flatCommandMenuItemToDeactivate: shouldDeactivate
        ? {
            ...dispatchIsActiveUpdateToAuthoredOverride({
              metadataName: 'commandMenuItem',
              flatEntity: flatCommandMenuItemToDelete,
              isActive: false,
              authorUniversalIdentifier:
                workspaceCustomFlatApplication.universalIdentifier,
              workspaceCustomApplicationUniversalIdentifier:
                workspaceCustomFlatApplication.universalIdentifier,
            }),
            updatedAt: new Date().toISOString(),
          }
        : undefined,
    };
  }

  private async runCommandMenuItemMigration({
    workspaceId,
    operations,
    failureMessage,
  }: {
    workspaceId: string;
    operations: {
      flatEntityToCreate?: FlatCommandMenuItem[];
      flatEntityToUpdate?: FlatCommandMenuItem[];
      flatEntityToDelete?: FlatCommandMenuItem[];
    };
    failureMessage: string;
  }): Promise<void> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: operations.flatEntityToCreate ?? [],
              flatEntityToDelete: operations.flatEntityToDelete ?? [],
              flatEntityToUpdate: operations.flatEntityToUpdate ?? [],
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
        failureMessage,
      );
    }
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
      !isDefined(commandMenuItem.navigationTargetObjectMetadataId)
    ) {
      return null;
    }

    return objectMetadataLoader.load({
      objectMetadataId: commandMenuItem.navigationTargetObjectMetadataId,
      workspaceId,
    });
  }

  async resolveTranslatedField({
    commandMenuItem,
    fieldName,
    objectMetadataLoader,
    loaders,
    workspaceId,
    locale,
  }: {
    commandMenuItem: CommandMenuItemDTO;
    fieldName: 'label' | 'shortLabel' | 'icon';
    objectMetadataLoader: DataLoader<
      ObjectMetadataLoaderPayload,
      ObjectMetadataDTO | null
    >;
    loaders: IDataloaders;
    workspaceId: string;
    locale: keyof typeof APP_LOCALES | undefined;
  }): Promise<string | undefined> {
    const i18nContext =
      await this.applicationTranslationCatalogService.buildEffectiveEntityI18nContext(
        {
          applicationId: commandMenuItem.applicationId,
          loaders,
          locale,
          workspaceId,
        },
      );

    const effectiveValue = resolveEffectiveEntityProperty({
      metadataName: 'commandMenuItem',
      baseValue: commandMenuItem[fieldName],
      overrides: commandMenuItem.overrides,
      property: fieldName,
      i18nContext,
    });

    // resolveEffectiveEntityProperty flattens null to '', which these nullable columns must not get
    const resolvedValue = isNonEmptyString(effectiveValue)
      ? effectiveValue
      : undefined;

    const objectMetadata = await this.loadNavigationObjectMetadata({
      commandMenuItem,
      objectMetadataLoader,
      workspaceId,
    });

    if (!isDefined(objectMetadata)) {
      return interpolateNavigationCommandMenuItemField({
        commandMenuItem,
        resolvedValue,
        objectMetadata: null,
        objectMetadataI18nContext: i18nContext,
      });
    }

    return interpolateNavigationCommandMenuItemField({
      commandMenuItem,
      resolvedValue,
      objectMetadata,
      // the target object may belong to another application than the item
      objectMetadataI18nContext:
        await this.applicationTranslationCatalogService.buildEffectiveEntityI18nContext(
          {
            applicationId: objectMetadata.applicationId,
            loaders,
            locale,
            workspaceId,
          },
        ),
    });
  }

  async findByCoreWorkflowVersionId(
    coreWorkflowVersionId: string,
    workspaceId: string,
  ): Promise<CommandMenuItemDTO | null> {
    const { flatCommandMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatCommandMenuItemMaps'] },
      );
    const flatCommandMenuItem = Object.values(
      flatCommandMenuItemMaps.byUniversalIdentifier,
    ).find(
      (item) =>
        isDefined(item) && item.coreWorkflowVersionId === coreWorkflowVersionId,
    );

    return isDefined(flatCommandMenuItem)
      ? fromFlatCommandMenuItemToCommandMenuItemDto(flatCommandMenuItem)
      : null;
  }
}
