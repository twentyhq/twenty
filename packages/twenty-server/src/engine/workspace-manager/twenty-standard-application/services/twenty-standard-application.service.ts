import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getSubFlatEntityMapsByApplicationIdOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-by-application-id-or-throw.util';
import { fromCreateNavigationMenuItemInputToFlatNavigationMenuItemToCreate } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/from-create-navigation-menu-item-input-to-flat-navigation-menu-item-to-create.util';
import { FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { TWENTY_STANDARD_ALL_METADATA_NAME } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-all-metadata-name.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { FromToAllFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

@Injectable()
export class TwentyStandardApplicationService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  // Note: To remove and handle natively in validateBuildAndRun after favorite migration to metadata
  private async createManyFavorite({
    flatViews,
    workspaceId,
  }: {
    flatViews: FlatView[];
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
      const favoriteToCreate = flatViews.map((flatView, index) => ({
        viewId: flatView.id,
        position: favoriteCount + index,
      }));

      await favoriteRepository.insert(favoriteToCreate);
    }, authContext);
  }

  private async createManyNavigationMenuItem({
    flatViews,
    workspaceId,
  }: {
    flatViews: FlatView[];
    workspaceId: string;
  }) {
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

    const existingWorkspaceItems = Object.values(
      existingFlatNavigationMenuItemMaps.byId,
    ).filter(
      (item) =>
        isDefined(item) &&
        item.workspaceId === workspaceId &&
        item.userWorkspaceId === null,
    );

    const maxPosition = existingWorkspaceItems.reduce(
      (max, item) => Math.max(max, item?.position ?? 0),
      0,
    );

    const flatNavigationMenuItemsToCreate = flatViews.map((flatView, index) => {
      return fromCreateNavigationMenuItemInputToFlatNavigationMenuItemToCreate({
        createNavigationMenuItemInput: {
          viewId: flatView.id,
          userWorkspaceId: undefined,
          position: maxPosition + index + 1,
        },
        workspaceId,
        applicationId: workspaceCustomFlatApplication.id,
        flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps,
      });
    });

    if (flatNavigationMenuItemsToCreate.length === 0) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            navigationMenuItem: {
              flatEntityToCreate: flatNavigationMenuItemsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: true,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating workspace navigation menu items',
      );
    }
  }

  async synchronizeTwentyStandardApplicationOrThrow({
    workspaceId,
  }: {
    workspaceId: string;
  }) {
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );
    const { featureFlagsMap, ...fromTwentyStandardAllFlatEntityMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        ...TWENTY_STANDARD_ALL_METADATA_NAME.map(getMetadataFlatEntityMapsKey),
        'featureFlagsMap',
      ]);
    const toTwentyStandardAllFlatEntityMaps =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const fromToAllFlatEntityMaps: FromToAllFlatEntityMaps = {};

    for (const metadataName of TWENTY_STANDARD_ALL_METADATA_NAME) {
      const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);
      const fromFlatEntityMaps =
        fromTwentyStandardAllFlatEntityMaps[flatEntityMapsKey];
      const fromTo = {
        from: getSubFlatEntityMapsByApplicationIdOrThrow<
          MetadataFlatEntity<typeof metadataName>
        >({
          applicationId: twentyStandardFlatApplication.id,
          flatEntityMaps: fromFlatEntityMaps,
        }),
        to: toTwentyStandardAllFlatEntityMaps[flatEntityMapsKey],
      };

      // @ts-expect-error Metadata flat entity maps cache key and metadataName colliding
      fromToAllFlatEntityMaps[flatEntityMapsKey] = fromTo;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo(
        {
          buildOptions: {
            isSystemBuild: true,
            inferDeletionFromMissingEntities: true,
          },
          fromToAllFlatEntityMaps,
          workspaceId,
          additionalCacheDataMaps: {
            featureFlagsMap,
          },
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while synchronizing twenty-standard application',
      );
    }

    const { flatViewMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatViewMaps'],
    );

    const flatViews = [
      STANDARD_OBJECTS.company.views.allCompanies.universalIdentifier,
      STANDARD_OBJECTS.dashboard.views.allDashboards.universalIdentifier,
      STANDARD_OBJECTS.note.views.allNotes.universalIdentifier,
      STANDARD_OBJECTS.opportunity.views.allOpportunities.universalIdentifier,
      STANDARD_OBJECTS.person.views.allPeople.universalIdentifier,
      STANDARD_OBJECTS.task.views.allTasks.universalIdentifier,
      STANDARD_OBJECTS.workflow.views.allWorkflows.universalIdentifier,
    ]
      .map((universalIdentifier) =>
        findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatViewMaps,
          universalIdentifier,
        }),
      )
      .filter(isDefined);

    await this.createManyFavorite({
      flatViews,
      workspaceId,
    });
  }
}
