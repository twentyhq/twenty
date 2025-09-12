import { Injectable, Logger } from '@nestjs/common';

import {
  WorkspaceMigrationOrchestratorBuildArgs,
  WorkspaceMigrationOrchestratorFailedResult,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { WorkspaceMigrationV2ViewFieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/workspace-migration-v2-view-field-actions-builder.service';
import {
  FailedEntityMigrationBuildResult,
  SuccessfulEntityMigrationBuildResult,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import {
  FailedWorkspaceMigrationBuildResult,
  SuccessfulWorkspaceMigrationBuildResult,
  WorkspaceMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';
import { WorkspaceViewMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-view-migration-builder-v2.service';
import { WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import {
  WorkspaceMigrationV2Exception,
  WorkspaceMigrationV2ExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration.exception';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class WorkspaceMigrationBuildOrchestratorService {
  private readonly logger = new Logger(
    WorkspaceMigrationBuildOrchestratorService.name,
  );

  constructor(
    private readonly workspaceMigrationBuilderV2Service: WorkspaceMigrationBuilderV2Service,
    private readonly workspaceViewMigrationBuilderV2Service: WorkspaceViewMigrationBuilderV2Service,
    private readonly workspaceMigrationV2ViewFieldActionsBuilderService: WorkspaceMigrationV2ViewFieldActionsBuilderService,
  ) {}

  public async buildWorkspaceMigrations({
    workspaceId,
    buildOptions,
    fromAllFlatEntityMaps,
    toAllFlatEntityMaps,
  }: WorkspaceMigrationOrchestratorBuildArgs): Promise<
    WorkspaceMigrationOrchestratorFailedResult | undefined
  > {
    try {
      const allActions: WorkspaceMigrationActionV2[] = [];
      const allFailures: WorkspaceMigrationOrchestratorFailedResult['errors'] =
        [];

      let opstimisticFlatEntityMaps = structuredClone(fromAllFlatEntityMaps);
      const dispatchBuildAndValidationActionResult = (
        result:
          | (
              | SuccessfulWorkspaceMigrationBuildResult
              | FailedWorkspaceMigrationBuildResult
            )
          | SuccessfulEntityMigrationBuildResult
          | FailedEntityMigrationBuildResult<any>, // improve
      ) => {
        opstimisticFlatEntityMaps = {
          ...opstimisticFlatEntityMaps,
          ...result.optimisticAllFlatEntityMaps,
        };

        if (result.status === 'fail') {
          allFailures.push(...result.errors);
        } else {
          allActions.push(...result.workspaceMigration.actions);
        }
      };

      if (isDefined(toAllFlatEntityMaps.flatObjectMetadataMaps)) {
        const objectResult =
          await this.workspaceMigrationBuilderV2Service.validateAndBuild({
            fromFlatObjectMetadataMaps:
              fromAllFlatEntityMaps.flatObjectMetadataMaps,
            toFlatObjectMetadataMaps:
              toAllFlatEntityMaps.flatObjectMetadataMaps,
            workspaceId,
            buildOptions,
          });

        dispatchBuildAndValidationActionResult(objectResult);
      }

      if (isDefined(toAllFlatEntityMaps.flatViewMaps)) {
        const viewResult =
          await this.workspaceViewMigrationBuilderV2Service.validateAndBuild({
            fromFlatViewMaps: fromAllFlatEntityMaps.flatViewMaps,
            toFlatViewMaps: toAllFlatEntityMaps.flatViewMaps,
            workspaceId,
            buildOptions,
            dependencyOptimisticEntityMaps: {
              object: optimisticEntityMaps.object,
            },
          });

        dispatchBuildAndValidationActionResult(viewResult);
      }

      if (isDefined(toAllFlatEntityMaps.flatViewFieldMaps)) {
        const viewFieldResult =
          await this.workspaceMigrationV2ViewFieldActionsBuilderService.validateAndBuild(
            {
              fromFlatViewFieldMaps: fromAllFlatEntityMaps.flatViewFieldMaps,
              toFlatViewFieldMaps: toAllFlatEntityMaps.flatViewFieldMaps,
              workspaceId,
              buildOptions,
              dependencyOptimisticEntityMaps: {
                object: optimisticEntityMaps.object,
                view: optimisticEntityMaps.view,
              },
            },
          );

        dispatchBuildAndValidationActionResult(viewFieldResult);
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
}
