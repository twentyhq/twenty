import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import {
  FeatureFlagKey,
  ViewKey,
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';
import { fromArrayToUniqueKeyRecord, isDefined } from 'twenty-shared/utils';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { v4 as uuidv4, v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreate } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-create-object-input-to-flat-object-metadata-and-flat-field-metadatas-to-create.util';
import { fromDeleteObjectInputToFlatFieldMetadatasToDelete } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-delete-object-input-to-flat-field-metadatas-to-delete.util';
import { fromUpdateObjectInputToFlatObjectMetadataAndRelatedFlatEntities } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-update-object-input-to-flat-object-metadata-and-related-flat-entities.util';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import { UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { computeFlatDefaultRecordPageLayoutToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-default-record-page-layout-to-create.util';
import { computeFlatRecordPageFieldsViewToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-record-page-fields-view-to-create.util';
import { computeFlatViewFieldsToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-view-fields-to-create.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

@Injectable()
export class ObjectMetadataService extends TypeOrmQueryService<ObjectMetadataEntity> {
  constructor(
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly applicationService: ApplicationService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    super(objectMetadataRepository);
  }

  async updateOneObject({
    updateObjectInput,
    workspaceId,
    ownerFlatApplication,
  }: {
    workspaceId: string;
    updateObjectInput: UpdateOneObjectInput;
    ownerFlatApplication?: FlatApplication;
  }): Promise<FlatObjectMetadata> {
    const resolvedOwnerFlatApplication =
      ownerFlatApplication ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication;

    const {
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      flatIndexMaps: existingFlatIndexMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatViewFieldMaps: existingFlatViewFieldMaps,
      flatViewMaps: existingFlatViewMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatObjectMetadataMaps',
          'flatIndexMaps',
          'flatFieldMetadataMaps',
          'flatViewFieldMaps',
          'flatViewMaps',
        ],
      },
    );

    const {
      otherObjectFlatFieldMetadatasToUpdate,
      sameObjectFlatFieldMetadatasToUpdate,
      flatObjectMetadataToUpdate,
      flatIndexMetadatasToUpdate,
      flatViewFieldsToCreate,
      flatViewFieldsToUpdate,
    } = fromUpdateObjectInputToFlatObjectMetadataAndRelatedFlatEntities({
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      updateObjectInput,
      flatIndexMaps: existingFlatIndexMaps,
      flatViewFieldMaps: existingFlatViewFieldMaps,
      flatViewMaps: existingFlatViewMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            objectMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatObjectMetadataToUpdate],
            },
            index: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: flatIndexMetadatasToUpdate,
            },
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [
                ...otherObjectFlatFieldMetadatasToUpdate,
                ...sameObjectFlatFieldMetadatasToUpdate,
              ],
            },
            viewField: {
              flatEntityToCreate: flatViewFieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: flatViewFieldsToUpdate,
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            resolvedOwnerFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating object',
      );
    }

    const { flatObjectMetadataMaps: recomputedFlatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const updatedFlatObjectMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatObjectMetadataToUpdate.universalIdentifier,
      flatEntityMaps: recomputedFlatObjectMetadataMaps,
    });

    if (!isDefined(updatedFlatObjectMetadata)) {
      throw new ObjectMetadataException(
        'Updated object metadata not found in recomputed cache',
        ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    if (isDefined(updateObjectInput.update.labelIdentifierFieldMetadataId)) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'rolesPermissions',
      ]);
    }

    if (isDefined(updateObjectInput.update.isActive)) {
      await this.flatEntityMapsCacheService.invalidateFlatEntityMaps({
        workspaceId,
        flatMapsKeys: ['flatNavigationMenuItemMaps'],
      });
    }

    return updatedFlatObjectMetadata;
  }

  async deleteOneObject({
    deleteObjectInput,
    workspaceId,
    isSystemBuild = false,
    ownerFlatApplication,
  }: {
    deleteObjectInput: DeleteOneObjectInput;
    workspaceId: string;
    isSystemBuild?: boolean;
    ownerFlatApplication?: FlatApplication;
  }): Promise<FlatObjectMetadata> {
    const deletedObjectMetadataDtos = await this.deleteManyObjectMetadatas({
      deleteObjectInputs: [deleteObjectInput],
      workspaceId,
      isSystemBuild,
      ownerFlatApplication,
    });

    if (deletedObjectMetadataDtos.length !== 1) {
      throw new ObjectMetadataException(
        'Could not retrieve deleted object metadata dto',
        ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const [deletedObjectMetadataDto] = deletedObjectMetadataDtos;

    return deletedObjectMetadataDto;
  }

  private async deleteManyObjectMetadatas({
    workspaceId,
    deleteObjectInputs,
    isSystemBuild = false,
    ownerFlatApplication,
  }: {
    deleteObjectInputs: DeleteOneObjectInput[];
    workspaceId: string;
    isSystemBuild?: boolean;
    ownerFlatApplication?: FlatApplication;
  }): Promise<FlatObjectMetadata[]> {
    if (deleteObjectInputs.length === 0) {
      return [];
    }

    const resolvedOwnerFlatApplication =
      ownerFlatApplication ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication;

    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatObjectMetadataMaps',
            'flatIndexMaps',
            'flatFieldMetadataMaps',
          ],
        },
      );

    const initialAccumulator: {
      flatFieldMetadatasToDeleteByUniversalIdentifier: Record<
        string,
        UniversalFlatFieldMetadata
      >;
      flatObjectMetadatasToDeleteByUniversalIdentifier: Record<
        string,
        UniversalFlatObjectMetadata
      >;
      flatIndexToDeleteByUniversalIdentifier: Record<string, FlatIndexMetadata>;
    } = {
      flatFieldMetadatasToDeleteByUniversalIdentifier: {},
      flatIndexToDeleteByUniversalIdentifier: {},
      flatObjectMetadatasToDeleteByUniversalIdentifier: {},
    };

    const {
      flatFieldMetadatasToDeleteByUniversalIdentifier,
      flatIndexToDeleteByUniversalIdentifier,
      flatObjectMetadatasToDeleteByUniversalIdentifier,
    } = deleteObjectInputs.reduce((accumulator, deleteObjectInput) => {
      const {
        flatFieldMetadatasToDelete,
        flatObjectMetadataToDelete,
        flatIndexToDelete,
      } = fromDeleteObjectInputToFlatFieldMetadatasToDelete({
        flatObjectMetadataMaps,
        flatIndexMaps,
        flatFieldMetadataMaps,
        deleteObjectInput,
      });

      return {
        flatFieldMetadatasToDeleteByUniversalIdentifier: {
          ...accumulator.flatFieldMetadatasToDeleteByUniversalIdentifier,
          ...fromArrayToUniqueKeyRecord({
            array: flatFieldMetadatasToDelete,
            uniqueKey: 'universalIdentifier',
          }),
        },
        flatIndexToDeleteByUniversalIdentifier: {
          ...accumulator.flatIndexToDeleteByUniversalIdentifier,
          ...fromArrayToUniqueKeyRecord({
            array: flatIndexToDelete,
            uniqueKey: 'universalIdentifier',
          }),
        },
        flatObjectMetadatasToDeleteByUniversalIdentifier: {
          ...accumulator.flatObjectMetadatasToDeleteByUniversalIdentifier,
          [flatObjectMetadataToDelete.universalIdentifier]:
            flatObjectMetadataToDelete,
        },
      };
    }, initialAccumulator);

    const {
      flatFieldMetadatasToDelete,
      flatObjectMetadatasToDelete,
      flatIndexToDelete,
    } = {
      flatFieldMetadatasToDelete: Object.values(
        flatFieldMetadatasToDeleteByUniversalIdentifier,
      ),
      flatObjectMetadatasToDelete: Object.values(
        flatObjectMetadatasToDeleteByUniversalIdentifier,
      ),
      flatIndexToDelete: Object.values(flatIndexToDeleteByUniversalIdentifier),
    };

    const deletedFlatObjectMetadatas = flatObjectMetadatasToDelete.map(
      (flatObjectMetadataToDelete) =>
        findFlatEntityByUniversalIdentifierOrThrow({
          universalIdentifier: flatObjectMetadataToDelete.universalIdentifier,
          flatEntityMaps: flatObjectMetadataMaps,
        }),
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            objectMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: flatObjectMetadatasToDelete,
              flatEntityToUpdate: [],
            },
            index: {
              flatEntityToCreate: [],
              flatEntityToDelete: flatIndexToDelete,
              flatEntityToUpdate: [],
            },
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: flatFieldMetadatasToDelete,
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild,
          applicationUniversalIdentifier:
            resolvedOwnerFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        `Multiple validation errors occurred while deleting object${deleteObjectInputs.length > 1 ? 's' : ''}`,
      );
    }

    return deletedFlatObjectMetadatas;
  }

  async createOneObject({
    createObjectInput,
    workspaceId,
    ownerFlatApplication,
  }: {
    createObjectInput: CreateObjectInput;
    workspaceId: string;
    ownerFlatApplication?: FlatApplication;
  }): Promise<FlatObjectMetadata> {
    const { workspaceCustomFlatApplication, twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const resolvedOwnerFlatApplication =
      ownerFlatApplication ?? workspaceCustomFlatApplication;

    const {
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      featureFlagsMap: existingFeatureFlagsMap,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'featureFlagsMap',
    ]);

    const {
      flatObjectMetadataToCreate,
      flatIndexMetadataToCreate,
      flatFieldMetadataToCreateOnObject,
      relationTargetFlatFieldMetadataToCreate,
    } = fromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreate({
      createObjectInput,
      flatApplication: resolvedOwnerFlatApplication,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
    });

    const flatDefaultViewToCreate = this.computeFlatViewToCreate({
      objectMetadata: flatObjectMetadataToCreate,
      flatApplication: resolvedOwnerFlatApplication,
    });

    const flatDefaultViewFieldsToCreate = computeFlatViewFieldsToCreate({
      flatApplication: workspaceCustomFlatApplication,
      objectFlatFieldMetadatas: flatFieldMetadataToCreateOnObject,
      labelIdentifierFieldMetadataUniversalIdentifier:
        flatObjectMetadataToCreate.labelIdentifierFieldMetadataUniversalIdentifier,
      viewUniversalIdentifier: flatDefaultViewToCreate.universalIdentifier,
    });

    const isRecordPageLayoutEditingEnabled =
      existingFeatureFlagsMap[
        FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED
      ] ?? false;

    const flatNavigationMenuItemToCreate =
      await this.computeFlatNavigationMenuItemToCreate({
        objectMetadata: flatObjectMetadataToCreate,
        workspaceId,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
        workspaceCustomApplicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            objectMetadata: {
              flatEntityToCreate: [flatObjectMetadataToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            view: {
              flatEntityToCreate: [flatDefaultViewToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: flatDefaultViewFieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            fieldMetadata: {
              flatEntityToCreate: [
                ...flatFieldMetadataToCreateOnObject,
                ...relationTargetFlatFieldMetadataToCreate,
              ],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            index: {
              flatEntityToCreate: flatIndexMetadataToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            ...(isDefined(flatNavigationMenuItemToCreate)
              ? {
                  navigationMenuItem: {
                    flatEntityToCreate: [flatNavigationMenuItemToCreate],
                    flatEntityToDelete: [],
                    flatEntityToUpdate: [],
                  },
                }
              : {}),
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            resolvedOwnerFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating object',
      );
    }

    if (isRecordPageLayoutEditingEnabled) {
      const flatRecordPageFieldsViewToCreate =
        this.computeFlatRecordPageFieldsViewToCreate({
          objectMetadata: flatObjectMetadataToCreate,
          flatApplication: twentyStandardFlatApplication,
        });

      const flatRecordPageFieldsViewFieldsToCreate =
        computeFlatViewFieldsToCreate({
          flatApplication: twentyStandardFlatApplication,
          objectFlatFieldMetadatas: flatFieldMetadataToCreateOnObject,
          labelIdentifierFieldMetadataUniversalIdentifier:
            flatObjectMetadataToCreate.labelIdentifierFieldMetadataUniversalIdentifier,
          viewUniversalIdentifier:
            flatRecordPageFieldsViewToCreate.universalIdentifier,
          excludeLabelIdentifier: true,
        });

      const flatDefaultRecordPageLayoutsToCreate =
        this.computeFlatDefaultRecordPageLayoutToCreate({
          objectMetadata: flatObjectMetadataToCreate,
          flatApplication: twentyStandardFlatApplication,
          recordPageFieldsView: flatRecordPageFieldsViewToCreate,
          workspaceId,
        });

      const pageLayoutMigrationResult =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            allFlatEntityOperationByMetadataName: {
              view: {
                flatEntityToCreate: [flatRecordPageFieldsViewToCreate],
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
              viewField: {
                flatEntityToCreate: flatRecordPageFieldsViewFieldsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
              pageLayout: {
                flatEntityToCreate:
                  flatDefaultRecordPageLayoutsToCreate.pageLayouts,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
              pageLayoutTab: {
                flatEntityToCreate:
                  flatDefaultRecordPageLayoutsToCreate.pageLayoutTabs,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
              pageLayoutWidget: {
                flatEntityToCreate:
                  flatDefaultRecordPageLayoutsToCreate.pageLayoutWidgets,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
            },
            workspaceId,
            applicationUniversalIdentifier:
              twentyStandardFlatApplication.universalIdentifier,
          },
        );

      if (pageLayoutMigrationResult.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          pageLayoutMigrationResult,
          'Multiple validation errors occurred while creating page layouts for object',
        );
      }
    }

    const { flatObjectMetadataMaps: recomputedFlatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const createdFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatObjectMetadataToCreate.id,
      flatEntityMaps: recomputedFlatObjectMetadataMaps,
    });

    if (!isDefined(createdFlatObjectMetadata)) {
      throw new ObjectMetadataException(
        'Created object metadata not found in recomputed cache',
        ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    return createdFlatObjectMetadata;
  }

  private computeFlatViewToCreate({
    objectMetadata,
    flatApplication,
  }: {
    flatApplication: FlatApplication;
    objectMetadata: UniversalFlatObjectMetadata & { id: string };
  }): UniversalFlatView & { id: string } {
    const createdAt = new Date().toISOString();

    return {
      id: v4(),
      objectMetadataUniversalIdentifier: objectMetadata.universalIdentifier,
      name: `All {objectLabelPlural}`,
      key: ViewKey.INDEX,
      icon: 'IconList',
      type: ViewType.TABLE,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      isCustom: true,
      anyFieldFilterValue: null,
      calendarFieldMetadataUniversalIdentifier: null,
      calendarLayout: null,
      isCompact: false,
      shouldHideEmptyGroups: false,
      kanbanAggregateOperation: null,
      kanbanAggregateOperationFieldMetadataUniversalIdentifier: null,
      mainGroupByFieldMetadataUniversalIdentifier: null,
      openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
      position: 0,
      universalIdentifier: v4(),
      visibility: ViewVisibility.WORKSPACE,
      createdByUserWorkspaceId: null,
      viewFieldUniversalIdentifiers: [],
      viewFieldGroupUniversalIdentifiers: [],
      viewFilterUniversalIdentifiers: [],
      viewGroupUniversalIdentifiers: [],
      viewFilterGroupUniversalIdentifiers: [],
      viewSortUniversalIdentifiers: [],
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
    };
  }

  private computeFlatRecordPageFieldsViewToCreate({
    objectMetadata,
    flatApplication,
  }: {
    flatApplication: FlatApplication;
    objectMetadata: UniversalFlatObjectMetadata & { id: string };
  }): UniversalFlatView & { id: string } {
    return computeFlatRecordPageFieldsViewToCreate({
      objectMetadata,
      flatApplication,
    });
  }

  private computeFlatDefaultRecordPageLayoutToCreate({
    objectMetadata,
    flatApplication,
    recordPageFieldsView,
    workspaceId,
  }: {
    flatApplication: FlatApplication;
    objectMetadata: UniversalFlatObjectMetadata & { id: string };
    recordPageFieldsView: UniversalFlatView & { id: string };
    workspaceId: string;
  }): {
    pageLayouts: FlatPageLayout[];
    pageLayoutTabs: FlatPageLayoutTab[];
    pageLayoutWidgets: FlatPageLayoutWidget[];
  } {
    return computeFlatDefaultRecordPageLayoutToCreate({
      objectMetadata,
      flatApplication,
      recordPageFieldsView,
      workspaceId,
    });
  }

  private async computeFlatNavigationMenuItemToCreate({
    objectMetadata,
    workspaceId,
    workspaceCustomApplicationId,
    workspaceCustomApplicationUniversalIdentifier,
  }: {
    objectMetadata: { id: string; universalIdentifier: string };
    workspaceId: string;
    workspaceCustomApplicationId: string;
    workspaceCustomApplicationUniversalIdentifier: string;
  }): Promise<FlatNavigationMenuItem> {
    const { flatNavigationMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatNavigationMenuItemMaps',
      ]);

    const workspaceLevelItems = Object.values(
      flatNavigationMenuItemMaps.byUniversalIdentifier,
    ).filter(
      (item): item is FlatNavigationMenuItem =>
        isDefined(item) && !isDefined(item.userWorkspaceId),
    );
    const nextPosition =
      workspaceLevelItems.length > 0
        ? Math.max(...workspaceLevelItems.map((item) => item.position)) + 1
        : 0;

    const newId = uuidv4();
    const now = new Date().toISOString();

    return {
      id: newId,
      type: NavigationMenuItemType.OBJECT,
      universalIdentifier: newId,
      userWorkspaceId: null,
      targetRecordId: null,
      targetObjectMetadataId: objectMetadata.id,
      targetObjectMetadataUniversalIdentifier:
        objectMetadata.universalIdentifier,
      viewId: null,
      viewUniversalIdentifier: null,
      folderId: null,
      folderUniversalIdentifier: null,
      name: null,
      link: null,
      icon: null,
      color: null,
      position: nextPosition,
      workspaceId,
      applicationId: workspaceCustomApplicationId,
      applicationUniversalIdentifier:
        workspaceCustomApplicationUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    };
  }

  public async findOneWithinWorkspace(
    workspaceId: string,
    options: FindOneOptions<ObjectMetadataEntity>,
  ): Promise<ObjectMetadataEntity | null> {
    return this.objectMetadataRepository.findOne({
      relations: [
        'fields',
        'indexMetadatas',
        'indexMetadatas.indexFieldMetadatas',
      ],
      ...options,
      where: {
        ...options.where,
        workspaceId,
      },
    });
  }

  public async findManyWithinWorkspace(
    workspaceId: string,
    options?: FindManyOptions<ObjectMetadataEntity>,
  ): Promise<FlatObjectMetadata[]> {
    const objectMetadataEntities = await this.objectMetadataRepository.find({
      ...options,
      where: {
        ...options?.where,
        workspaceId,
      },
      order: {
        ...options?.order,
      },
      select: { id: true },
    });

    const objectMetadataIds = objectMetadataEntities.map(
      (objectMetadata) => objectMetadata.id,
    );

    const { flatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const filteredOutAndSortedFlatObjectMetadataMaps =
      findManyFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatObjectMetadataMaps,
        flatEntityIds: objectMetadataIds,
      });

    return filteredOutAndSortedFlatObjectMetadataMaps;
  }
}
