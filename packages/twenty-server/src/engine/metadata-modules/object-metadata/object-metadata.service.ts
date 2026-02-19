import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import {
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';
import { fromArrayToUniqueKeyRecord, isDefined } from 'twenty-shared/utils';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { v4 as uuidv4, v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
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
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import { UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  TAB_PROPS,
  WIDGET_PROPS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
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
      flatApplication: resolvedOwnerFlatApplication,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      existingFeatureFlagsMap,
    });

    const flatDefaultViewToCreate = this.computeFlatViewToCreate({
      objectMetadata: flatObjectMetadataToCreate,
      flatApplication: resolvedOwnerFlatApplication,
    });

    const flatDefaultViewFieldsToCreate =
      await this.computeFlatViewFieldsToCreate({
        flatApplication: workspaceCustomFlatApplication,
        objectFlatFieldMetadatas: flatFieldMetadataToCreateOnObject,
        labelIdentifierFieldMetadataUniversalIdentifier:
          flatObjectMetadataToCreate.labelIdentifierFieldMetadataUniversalIdentifier,
        viewUniversalIdentifier: flatDefaultViewToCreate.universalIdentifier,
      });

    let flatRecordPageFieldsViewToCreate:
      | (UniversalFlatView & { id: string })
      | null = null;
    let flatRecordPageFieldsViewFieldsToCreate: UniversalFlatViewField[] = [];
    let flatDefaultRecordPageLayoutsToCreate: {
      pageLayouts: FlatPageLayout[];
      pageLayoutTabs: FlatPageLayoutTab[];
      pageLayoutWidgets: FlatPageLayoutWidget[];
    } = {
      pageLayouts: [],
      pageLayoutTabs: [],
      pageLayoutWidgets: [],
    };

    if (
      existingFeatureFlagsMap[
        FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED
      ] ??
      false
    ) {
      flatRecordPageFieldsViewToCreate =
        this.computeFlatRecordPageFieldsViewToCreate({
          objectMetadata: flatObjectMetadataToCreate,
          flatApplication: resolvedOwnerFlatApplication,
        });

      flatRecordPageFieldsViewFieldsToCreate =
        await this.computeFlatViewFieldsToCreate({
          flatApplication: workspaceCustomFlatApplication,
          objectFlatFieldMetadatas: flatFieldMetadataToCreateOnObject,
          labelIdentifierFieldMetadataUniversalIdentifier:
            flatObjectMetadataToCreate.labelIdentifierFieldMetadataUniversalIdentifier,
          viewUniversalIdentifier:
            flatRecordPageFieldsViewToCreate.universalIdentifier,
        });

      flatDefaultRecordPageLayoutsToCreate =
        this.computeFlatDefaultRecordPageLayoutToCreate({
          objectMetadata: flatObjectMetadataToCreate,
          flatApplication: resolvedOwnerFlatApplication,
          recordPageFieldsView: flatRecordPageFieldsViewToCreate,
          workspaceId,
        });
    }

    const flatNavigationMenuItemToCreate =
      await this.computeFlatNavigationMenuItemToCreate({
        view: flatDefaultViewToCreate,
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
              flatEntityToCreate: [
                flatDefaultViewToCreate,
                ...(isDefined(flatRecordPageFieldsViewToCreate)
                  ? [flatRecordPageFieldsViewToCreate]
                  : []),
              ],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: [
                ...flatDefaultViewFieldsToCreate,
                ...flatRecordPageFieldsViewFieldsToCreate,
              ],
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
            pageLayout: {
              flatEntityToCreate: [
                ...flatDefaultRecordPageLayoutsToCreate.pageLayouts,
              ],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            pageLayoutTab: {
              flatEntityToCreate: [
                ...flatDefaultRecordPageLayoutsToCreate.pageLayoutTabs,
              ],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            pageLayoutWidget: {
              flatEntityToCreate: [
                ...flatDefaultRecordPageLayoutsToCreate.pageLayoutWidgets,
              ],
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

    await this.createWorkspaceFavoriteForNewObjectDefaultView({
      view: flatDefaultViewToCreate,
      workspaceId,
    });

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
    const createdAt = new Date().toISOString();

    return {
      id: v4(),
      objectMetadataUniversalIdentifier: objectMetadata.universalIdentifier,
      name: `${objectMetadata.labelSingular} Record Page Fields`,
      key: null,
      icon: 'IconList',
      type: ViewType.FIELDS_WIDGET,
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
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
    };
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
    const now = new Date().toISOString();
    const pageLayoutId = v4();
    const pageLayoutUniversalIdentifier = v4();

    const tabDefinitions = [
      { key: 'home' as const, widgetKey: 'fields' as const },
      { key: 'timeline' as const, widgetKey: 'timeline' as const },
      { key: 'tasks' as const, widgetKey: 'tasks' as const },
      { key: 'notes' as const, widgetKey: 'notes' as const },
      { key: 'files' as const, widgetKey: 'files' as const },
      { key: 'emails' as const, widgetKey: 'emails' as const },
      { key: 'calendar' as const, widgetKey: 'calendar' as const },
    ];

    const pageLayoutTabs: FlatPageLayoutTab[] = [];
    const pageLayoutWidgets: FlatPageLayoutWidget[] = [];

    for (const { key, widgetKey } of tabDefinitions) {
      const tabProps = TAB_PROPS[key];
      const widgetProps = WIDGET_PROPS[widgetKey];
      const tabId = v4();
      const tabUniversalIdentifier = v4();
      const widgetId = v4();
      const widgetUniversalIdentifier = v4();

      pageLayoutTabs.push({
        id: tabId,
        universalIdentifier: tabUniversalIdentifier,
        applicationId: flatApplication.id,
        applicationUniversalIdentifier: flatApplication.universalIdentifier,
        workspaceId,
        title: tabProps.title,
        position: tabProps.position,
        pageLayoutId,
        pageLayoutUniversalIdentifier,
        widgetIds: [widgetId],
        widgetUniversalIdentifiers: [widgetUniversalIdentifier],
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        icon: tabProps.icon,
        layoutMode: tabProps.layoutMode,
      });

      const isFieldsWidget = widgetKey === 'fields';

      const configuration = isFieldsWidget
        ? {
            configurationType: WidgetConfigurationType.FIELDS,
            viewId: recordPageFieldsView.id,
          }
        : {
            configurationType:
              WidgetConfigurationType[
                widgetKey.toUpperCase() as keyof typeof WidgetConfigurationType
              ],
          };

      const universalConfiguration = isFieldsWidget
        ? {
            configurationType: WidgetConfigurationType.FIELDS,
            viewId: recordPageFieldsView.universalIdentifier,
          }
        : {
            configurationType:
              WidgetConfigurationType[
                widgetKey.toUpperCase() as keyof typeof WidgetConfigurationType
              ],
          };

      pageLayoutWidgets.push({
        id: widgetId,
        universalIdentifier: widgetUniversalIdentifier,
        applicationId: flatApplication.id,
        applicationUniversalIdentifier: flatApplication.universalIdentifier,
        workspaceId,
        pageLayoutTabId: tabId,
        pageLayoutTabUniversalIdentifier: tabUniversalIdentifier,
        title: widgetProps.title,
        type: widgetProps.type,
        gridPosition: widgetProps.gridPosition,
        position: widgetProps.position,
        // @ts-expect-error - configurationType is validated but TS can't match to discriminated union
        configuration,
        // @ts-expect-error - configurationType is validated but TS can't match to discriminated union
        universalConfiguration,
        objectMetadataId: objectMetadata.id,
        objectMetadataUniversalIdentifier: objectMetadata.universalIdentifier,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        conditionalDisplay: null,
      });
    }

    const pageLayout: FlatPageLayout = {
      id: pageLayoutId,
      universalIdentifier: pageLayoutUniversalIdentifier,
      applicationId: flatApplication.id,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      workspaceId,
      name: `Default ${objectMetadata.labelSingular} Layout`,
      type: PageLayoutType.RECORD_PAGE,
      objectMetadataId: objectMetadata.id,
      objectMetadataUniversalIdentifier: objectMetadata.universalIdentifier,
      tabIds: pageLayoutTabs.map((tab) => tab.id),
      tabUniversalIdentifiers: pageLayoutTabs.map(
        (tab) => tab.universalIdentifier,
      ),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      defaultTabToFocusOnMobileAndSidePanelId: null,
      defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: null,
    };

    return { pageLayouts: [pageLayout], pageLayoutTabs, pageLayoutWidgets };
  }

  private async computeFlatViewFieldsToCreate({
    objectFlatFieldMetadatas,
    viewUniversalIdentifier,
    flatApplication,
    labelIdentifierFieldMetadataUniversalIdentifier,
  }: {
    flatApplication: FlatApplication;
    objectFlatFieldMetadatas: UniversalFlatFieldMetadata[];
    viewUniversalIdentifier: string;
    labelIdentifierFieldMetadataUniversalIdentifier: string | null;
  }) {
    const createdAt = new Date().toISOString();
    const defaultViewFields = objectFlatFieldMetadatas
      .filter(
        (field) =>
          field.name !== 'deletedAt' &&
          // Include 'id' only if it's the label identifier (e.g., for junction tables)
          (field.name !== 'id' ||
            field.universalIdentifier ===
              labelIdentifierFieldMetadataUniversalIdentifier),
      )
      .map<UniversalFlatViewField>((field, index) => ({
        fieldMetadataUniversalIdentifier: field.universalIdentifier,
        viewUniversalIdentifier,
        viewFieldGroupUniversalIdentifier: null,
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
        universalIdentifier: v4(),
        isVisible: true,
        size: DEFAULT_VIEW_FIELD_SIZE,
        position: index,
        aggregateOperation: null,
        applicationUniversalIdentifier: flatApplication.universalIdentifier,
      }));

    return defaultViewFields;
  }

  private async computeFlatNavigationMenuItemToCreate({
    view,
    workspaceId,
    workspaceCustomApplicationId,
    workspaceCustomApplicationUniversalIdentifier,
  }: {
    view: UniversalFlatView & { id: string };
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
      link: null,
      icon: null,
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
    view: UniversalFlatView & { id: string };
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
