import { Injectable, Logger } from '@nestjs/common';

import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getSubFlatEntityMapsByApplicationIdOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-by-application-id-or-throw.util';
import { FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';
import { STANDARD_DASHBOARDS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-dashboard.constant';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { TWENTY_STANDARD_ALL_METADATA_NAME } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-all-metadata-name.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';
import { FromToAllFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

@Injectable()
export class TwentyStandardApplicationService {
  private readonly logger = new Logger(TwentyStandardApplicationService.name);

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
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

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
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
      },
    );
  }

  private async createStandardDashboards({
    workspaceId,
  }: {
    workspaceId: string;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    const { flatPageLayoutMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPageLayoutMaps',
      ]);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const dashboardRepository =
          await this.globalWorkspaceOrmManager.getRepository<DashboardWorkspaceEntity>(
            workspaceId,
            'dashboard',
            { shouldBypassPermissionChecks: true },
          );

        for (const [, dashboardDef] of Object.entries(STANDARD_DASHBOARDS)) {
          const pageLayout = findFlatEntityByUniversalIdentifier({
            flatEntityMaps: flatPageLayoutMaps,
            universalIdentifier: dashboardDef.pageLayoutUniversalIdentifier,
          });

          if (!isDefined(pageLayout)) {
            this.logger.warn(
              `Standard dashboard '${dashboardDef.title}' skipped: page layout with identifier '${dashboardDef.pageLayoutUniversalIdentifier}' not found`,
            );
            continue;
          }

          const dashboardId = generateSeedId(
            workspaceId,
            dashboardDef.seedName,
          );

          const existingDashboard = await dashboardRepository.findOne({
            where: { id: dashboardId },
          });

          if (isDefined(existingDashboard)) {
            this.logger.debug(
              `Standard dashboard '${dashboardDef.title}' already exists, skipping creation`,
            );
            continue;
          }

          await dashboardRepository.insert({
            id: dashboardId,
            title: dashboardDef.title,
            pageLayoutId: pageLayout.id,
            position: 0,
            createdBy: {
              source: FieldActorSource.SYSTEM,
              workspaceMemberId: null,
              name: 'System',
              context: {},
            },
            updatedBy: {
              source: FieldActorSource.SYSTEM,
              workspaceMemberId: null,
              name: 'System',
              context: {},
            },
          });
        }
      },
    );
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
      throw new WorkspaceMigrationBuilderExceptionV2(
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

    await this.createStandardDashboards({
      workspaceId,
    });
  }
}
