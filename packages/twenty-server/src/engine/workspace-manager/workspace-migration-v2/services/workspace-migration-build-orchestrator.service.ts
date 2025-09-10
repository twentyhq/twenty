import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'class-validator';

import { ViewCacheService } from 'src/engine/core-modules/view/cache/services/view-cache.service';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceMigrationOrchestratorException } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-orchestrator-exception';
import {
  WorkspaceMigrationOrchestratorBuildArgs,
  WorkspaceMigrationOrchestratorEntityMaps,
  WorkspaceMigrationOrchestratorFailedResult,
  WorkspaceMigrationOrchestratorOptimisticEntityMaps,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';
import { WorkspaceViewFieldMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-view-field-migration-builder-v2.service';
import { WorkspaceViewMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-view-migration-builder-v2.service';
import { WorkspaceMigrationRunnerV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/services/workspace-migration-runner-v2.service';
import {
  WorkspaceMigrationV2Exception,
  WorkspaceMigrationV2ExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration.exception';

@Injectable()
export class WorkspaceMigrationBuildOrchestratorService {
  private readonly logger = new Logger(
    WorkspaceMigrationBuildOrchestratorService.name,
  );

  constructor(
    private readonly workspaceMigrationBuilderV2Service: WorkspaceMigrationBuilderV2Service,
    private readonly workspaceViewMigrationBuilderV2Service: WorkspaceViewMigrationBuilderV2Service,
    private readonly workspaceViewFieldMigrationBuilderV2Service: WorkspaceViewFieldMigrationBuilderV2Service,
    private readonly migrationRunner: WorkspaceMigrationRunnerV2Service,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly viewCacheService: ViewCacheService,
  ) {}

  public async buildWorkspaceMigrations({
    workspaceId,
    buildOptions,
    entityMaps,
  }: WorkspaceMigrationOrchestratorBuildArgs): Promise<
    WorkspaceMigrationOrchestratorFailedResult | undefined
  > {
    try {
      const allObjectAndFieldActions = [];
      const allViewActions = [];
      const allViewFieldActions = [];
      const allFailures = [];

      const optimisticEntityMaps = await this.prepareOptimisticEntityMaps({
        entityMaps,
        workspaceId,
      });

      if (entityMaps.object) {
        const objectResult =
          await this.workspaceMigrationBuilderV2Service.validateAndBuild({
            fromFlatObjectMetadataMaps:
              entityMaps.object.fromFlatObjectMetadataMaps,
            toFlatObjectMetadataMaps:
              entityMaps.object.toFlatObjectMetadataMaps,
            workspaceId,
            buildOptions,
          });

        if (objectResult.status === 'fail') {
          allFailures.push(...objectResult.errors);
        } else {
          optimisticEntityMaps.object = objectResult.optimisticFlatEntityMaps;
          allObjectAndFieldActions.push(
            ...objectResult.workspaceMigration.actions,
          );
        }
      }

      if (entityMaps.view) {
        const viewResult =
          await this.workspaceViewMigrationBuilderV2Service.validateAndBuild({
            fromFlatViewMaps: entityMaps.view.fromFlatViewMaps,
            toFlatViewMaps: entityMaps.view.toFlatViewMaps,
            workspaceId,
            buildOptions,
            dependencyOptimisticEntityMaps: {
              object: optimisticEntityMaps.object,
            },
          });

        if (viewResult.status === 'fail') {
          allFailures.push(...viewResult.errors);
        } else {
          optimisticEntityMaps.view = viewResult.optimisticFlatEntityMaps;
          allViewActions.push(...viewResult.workspaceMigration.actions);
        }
      }

      if (entityMaps.viewField) {
        const viewFieldResult =
          await this.workspaceViewFieldMigrationBuilderV2Service.validateAndBuild(
            {
              fromFlatViewFieldMaps: entityMaps.viewField.fromFlatViewFieldMaps,
              toFlatViewFieldMaps: entityMaps.viewField.toFlatViewFieldMaps,
              workspaceId,
              buildOptions,
              dependencyOptimisticEntityMaps: {
                object: optimisticEntityMaps.object,
                view: optimisticEntityMaps.view,
              },
            },
          );

        if (viewFieldResult.status === 'fail') {
          allFailures.push(...viewFieldResult.errors);
        } else {
          optimisticEntityMaps.viewField =
            viewFieldResult.optimisticFlatEntityMaps;
          allViewFieldActions.push(
            ...viewFieldResult.workspaceMigration.actions,
          );
        }
      }

      if (allFailures.length > 0) {
        return {
          status: 'fail',
          errors: allFailures,
        };
      }

      // TODO: return workspace migrations

      return;
    } catch (error) {
      this.logger.error(error);
      throw new WorkspaceMigrationV2Exception(
        WorkspaceMigrationV2ExceptionCode.BUILDER_INTERNAL_SERVER_ERROR,
        error.message,
      );
    }
  }

  // TODO: move to dedicated service
  private async prepareOptimisticEntityMaps({
    entityMaps,
    workspaceId,
  }: {
    entityMaps: WorkspaceMigrationOrchestratorEntityMaps;
    workspaceId: string;
  }): Promise<WorkspaceMigrationOrchestratorOptimisticEntityMaps> {
    const optimisticObjectMaps =
      entityMaps.object?.fromFlatObjectMetadataMaps ??
      (
        await this.workspaceMetadataCacheService.getExistingOrRecomputeFlatObjectMetadataMaps(
          { workspaceId },
        )
      ).flatObjectMetadataMaps;

    if (!isDefined(optimisticObjectMaps)) {
      throw new WorkspaceMigrationOrchestratorException(
        'Object metadata maps not found',
      );
    }

    const optimisticViewMaps =
      entityMaps.view?.fromFlatViewMaps ??
      (
        await this.viewCacheService.getExistingOrRecomputeFlatViewMaps({
          workspaceId,
        })
      ).flatViewMaps;

    if (!isDefined(optimisticViewMaps)) {
      throw new WorkspaceMigrationOrchestratorException('View maps not found');
    }

    // For ViewFields, if not provided, start with empty maps since ViewFields are optional
    const optimisticViewFieldMaps = entityMaps.viewField
      ?.fromFlatViewFieldMaps ?? {
      byId: {},
      idByUniversalIdentifier: {},
    };

    return {
      object: optimisticObjectMaps,
      view: optimisticViewMaps,
      viewField: optimisticViewFieldMaps,
    };
  }
}
