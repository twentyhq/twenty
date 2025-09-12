import { Injectable, Logger } from '@nestjs/common';
import { FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';

import {
  WorkspaceMigrationOrchestratorBuildArgs,
  WorkspaceMigrationOrchestratorFailedResult,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { WorkspaceMigrationV2ViewFieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/workspace-migration-v2-view-field-actions-builder.service';
import { WorkspaceMigrationV2ViewActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view/workspace-migration-v2-view-actions-builder.service';
import { ValidateAndBuildReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';
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
    private readonly workspaceMigrationV2ViewActionsBuilderService: WorkspaceMigrationV2ViewActionsBuilderService,
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
      const allFailures: FailedFlatEntityValidation<FlatEntity>[] = []; // Should be a record of each tested data

      let opstimisticFlatEntityMaps = structuredClone(fromAllFlatEntityMaps);
      const dispatchBuildAndValidationActionResult = (
        result: ValidateAndBuildReturnType<
          WorkspaceMigrationActionV2,
          FlatEntity
        >,
      ) => {
        opstimisticFlatEntityMaps = {
          ...opstimisticFlatEntityMaps,
          ...result.optimisticAllFlatEntityMaps,
        };

        if (result.status === 'fail') {
          allFailures.push(...result.errors);
        } else {
          allActions.push(...result.actions);
        }
      };

      //TODO
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

        dispatchBuildAndValidationActionResult(objectResult); // TODO
      }
      ///

      if (isDefined(toAllFlatEntityMaps.flatViewMaps)) {
        const viewResult =
          await this.workspaceMigrationV2ViewActionsBuilderService.validateAndBuild(
            {
              dependencyOptimisticFlatEntityMaps: {
                flatObjectMetadataMaps:
                  toAllFlatEntityMaps.flatObjectMetadataMaps,
              },
              from: fromAllFlatEntityMaps.flatViewMaps,
              to: toAllFlatEntityMaps.flatViewMaps,
              buildOptions,
            },
          );

        dispatchBuildAndValidationActionResult(viewResult);
      }

      if (isDefined(toAllFlatEntityMaps.flatViewFieldMaps)) {
        const viewFieldResult =
          await this.workspaceMigrationV2ViewFieldActionsBuilderService.validateAndBuild(
            {
              from: fromAllFlatEntityMaps.flatViewFieldMaps,
              to: toAllFlatEntityMaps.flatViewFieldMaps,
              buildOptions,
              dependencyOptimisticFlatEntityMaps: {
                flatObjectMetadataMaps:
                  toAllFlatEntityMaps.flatObjectMetadataMaps,
                flatViewMaps: toAllFlatEntityMaps.flatViewMaps,
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
