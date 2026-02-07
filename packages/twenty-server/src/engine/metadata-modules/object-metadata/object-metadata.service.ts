import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { fromArrayToUniqueKeyRecord, isDefined } from 'twenty-shared/utils';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromCreateObjectInputToFlatObjectMetadataAndFlatFieldMetadatasToCreate } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-create-object-input-to-flat-object-metadata-and-flat-field-metadatas-to-create.util';
import { fromDeleteObjectInputToFlatFieldMetadatasToDelete } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-delete-object-input-to-flat-field-metadatas-to-delete.util';
import { fromUpdateObjectInputToFlatObjectMetadataAndRelatedFlatEntities } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-update-object-input-to-flat-object-metadata-and-related-flat-entities.util';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { fromCreateViewFieldInputToFlatViewFieldToCreate } from 'src/engine/metadata-modules/flat-view-field/utils/from-create-view-field-input-to-flat-view-field-to-create.util';
import { FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { fromCreateViewInputToFlatViewToCreate } from 'src/engine/metadata-modules/flat-view/utils/from-create-view-input-to-flat-view-to-create.util';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import { UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

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

    if (isDefined(validateAndBuildResult)) {
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

    const updatedFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatObjectMetadataToUpdate.id,
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
      flatFieldMetadatasToDeleteById: Record<string, FlatFieldMetadata>;
      flatObjectMetadatasToDeleteById: Record<string, FlatObjectMetadata>;
      flatIndexToDeleteById: Record<string, FlatIndexMetadata>;
    } = {
      flatFieldMetadatasToDeleteById: {},
      flatIndexToDeleteById: {},
      flatObjectMetadatasToDeleteById: {},
    };

    const {
      flatFieldMetadatasToDeleteById,
      flatIndexToDeleteById,
      flatObjectMetadatasToDeleteById,
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
        flatFieldMetadatasToDeleteById: {
          ...accumulator.flatFieldMetadatasToDeleteById,
          ...fromArrayToUniqueKeyRecord({
            array: flatFieldMetadatasToDelete,
            uniqueKey: 'id',
          }),
        },
        flatIndexToDeleteById: {
          ...accumulator.flatIndexToDeleteById,
          ...fromArrayToUniqueKeyRecord({
            array: flatIndexToDelete,
            uniqueKey: 'id',
          }),
        },
        flatObjectMetadatasToDeleteById: {
          ...accumulator.flatObjectMetadatasToDeleteById,
          [flatObjectMetadataToDelete.id]: flatObjectMetadataToDelete,
        },
      };
    }, initialAccumulator);

    const {
      flatFieldMetadatasToDelete,
      flatObjectMetadatasToDelete,
      flatIndexToDelete,
    } = {
      flatFieldMetadatasToDelete: Object.values(flatFieldMetadatasToDeleteById),
      flatObjectMetadatasToDelete: Object.values(
        flatObjectMetadatasToDeleteById,
      ),
      flatIndexToDelete: Object.values(flatIndexToDeleteById),
    };

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

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        `Multiple validation errors occurred while deleting object${deleteObjectInputs.length > 1 ? 's' : ''}`,
      );
    }

    return flatObjectMetadatasToDelete;
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
    const { workspaceCustomFlatApplication } =
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
      workspaceId,
      flatApplication: resolvedOwnerFlatApplication,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      existingFeatureFlagsMap,
    });

    const optimisticFlatFieldMetadataMaps = [
      ...flatFieldMetadataToCreateOnObject,
      ...relationTargetFlatFieldMetadataToCreate,
    ].reduce<MetadataFlatEntityMaps<'fieldMetadata'>>(
      (flatEntityMaps, flatFieldMetadata) =>
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: flatFieldMetadata,
          flatEntityMaps,
        }),
      createEmptyFlatEntityMaps(),
    );

    const optimisticFlatObjectMetadataMaps =
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: flatObjectMetadataToCreate,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      });

    const flatDefaultViewToCreate = await this.computeFlatViewToCreate({
      objectMetadata: flatObjectMetadataToCreate,
      workspaceId,
      flatApplication: resolvedOwnerFlatApplication,
      flatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
      flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
    });

    const optimisticFlatViewMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatDefaultViewToCreate,
      flatEntityMaps: createEmptyFlatEntityMaps(),
    });

    const flatDefaultViewFieldsToCreate =
      await this.computeFlatViewFieldsToCreate({
        flatApplication: workspaceCustomFlatApplication,
        objectFlatFieldMetadatas: flatFieldMetadataToCreateOnObject,
        viewId: flatDefaultViewToCreate.id,
        workspaceId,
        labelIdentifierFieldMetadataId:
          flatObjectMetadataToCreate.labelIdentifierFieldMetadataId,
        flatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
        flatViewMaps: optimisticFlatViewMaps,
      });

    const isNavigationMenuItemEnabled =
      existingFeatureFlagsMap[FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_ENABLED] ??
      false;

    const flatNavigationMenuItemToCreate = isNavigationMenuItemEnabled
      ? await this.computeFlatNavigationMenuItemToCreate({
          view: flatDefaultViewToCreate,
          workspaceId,
          workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
          workspaceCustomApplicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        })
      : null;

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

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating object',
      );
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

    if (!isNavigationMenuItemEnabled) {
      await this.createWorkspaceFavoriteForNewObjectDefaultView({
        view: flatDefaultViewToCreate,
        workspaceId,
      });
    }

    return createdFlatObjectMetadata;
  }

  private async computeFlatViewToCreate({
    objectMetadata,
    workspaceId,
    flatApplication,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  }: {
    flatApplication: FlatApplication;
    objectMetadata: FlatObjectMetadata;
    workspaceId: string;
    flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
    flatObjectMetadataMaps: AllFlatEntityMaps['flatObjectMetadataMaps'];
  }) {
    const defaultViewInput = {
      objectMetadataId: objectMetadata.id,
      name: `All {objectLabelPlural}`,
      key: ViewKey.INDEX,
      icon: 'IconList',
      type: ViewType.TABLE,
      workspaceId: workspaceId,
    };

    const { flatViewToCreate } = fromCreateViewInputToFlatViewToCreate({
      createViewInput: defaultViewInput,
      workspaceId,
      flatApplication,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    });

    return flatViewToCreate;
  }

  private async computeFlatViewFieldsToCreate({
    objectFlatFieldMetadatas,
    viewId,
    workspaceId,
    flatApplication,
    labelIdentifierFieldMetadataId,
    flatFieldMetadataMaps,
    flatViewMaps,
  }: {
    flatApplication: FlatApplication;
    objectFlatFieldMetadatas: FlatFieldMetadata[];
    viewId: string;
    workspaceId: string;
    labelIdentifierFieldMetadataId: string | null;
    flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
    flatViewMaps: AllFlatEntityMaps['flatViewMaps'];
  }) {
    const defaultViewFields = objectFlatFieldMetadatas
      .filter(
        (field) =>
          field.name !== 'deletedAt' &&
          // Include 'id' only if it's the label identifier (e.g., for junction tables)
          (field.name !== 'id' || field.id === labelIdentifierFieldMetadataId),
      )
      .map((field, index) =>
        fromCreateViewFieldInputToFlatViewFieldToCreate({
          createViewFieldInput: {
            fieldMetadataId: field.id,
            position: index,
            isVisible: true,
            size: DEFAULT_VIEW_FIELD_SIZE,
            viewId: viewId,
          },
          flatApplication,
          workspaceId: workspaceId,
          flatFieldMetadataMaps,
          flatViewMaps,
        }),
      );

    return defaultViewFields;
  }

  private async computeFlatNavigationMenuItemToCreate({
    view,
    workspaceId,
    workspaceCustomApplicationId,
    workspaceCustomApplicationUniversalIdentifier,
  }: {
    view: FlatView;
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
      universalIdentifier: newId,
      userWorkspaceId: null,
      targetRecordId: null,
      targetObjectMetadataId: null,
      targetObjectMetadataUniversalIdentifier: null,
      viewId: view.id,
      viewUniversalIdentifier: view.universalIdentifier,
      folderId: null,
      folderUniversalIdentifier: null,
      name: null,
      position: nextPosition,
      workspaceId,
      applicationId: workspaceCustomApplicationId,
      applicationUniversalIdentifier:
        workspaceCustomApplicationUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    };
  }

  private async createWorkspaceFavoriteForNewObjectDefaultView({
    view,
    workspaceId,
  }: {
    view: FlatView;
    workspaceId: string;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const favoriteRepository =
        await this.globalWorkspaceOrmManager.getRepository<FavoriteWorkspaceEntity>(
          workspaceId,
          'favorite',
        );

      const favoriteCount = await favoriteRepository.count();

      await favoriteRepository.insert({
        viewId: view.id,
        position: favoriteCount,
      });
    }, authContext);
  }

  public async deleteWorkspaceAllObjectMetadata({
    workspaceId,
  }: {
    workspaceId: string;
  }) {
    const { flatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const deleteObjectInputs = Object.keys(
      flatObjectMetadataMaps.universalIdentifierById,
    )
      .filter(isDefined)
      .map<DeleteOneObjectInput>((id) => ({
        id,
      }));

    await this.deleteManyObjectMetadatas({
      deleteObjectInputs,
      workspaceId,
      isSystemBuild: true,
    });
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
