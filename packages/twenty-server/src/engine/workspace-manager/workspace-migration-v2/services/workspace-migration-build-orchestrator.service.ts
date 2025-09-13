import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  OrchestratorFailureReport,
  WorkspaceMigrationOrchestratorBuildArgs,
  WorkspaceMigrationOrchestratorFailedResult,
  WorkspaceMigrationOrchestratorSuccessfulResult,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { WorkspaceMigrationV2ViewFieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/workspace-migration-v2-view-field-actions-builder.service';
import { WorkspaceMigrationV2ViewActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view/workspace-migration-v2-view-actions-builder.service';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';
import { WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

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

  public async buildWorkspaceMigration({
    workspaceId,
    buildOptions,
    fromAllFlatEntityMaps,
    toAllFlatEntityMaps,
  }: WorkspaceMigrationOrchestratorBuildArgs): Promise<
    | WorkspaceMigrationOrchestratorFailedResult
    | WorkspaceMigrationOrchestratorSuccessfulResult
  > {
    const allActions: WorkspaceMigrationActionV2[] = [];
    const orchestratorFailureReport: OrchestratorFailureReport = {
      flatObjectMetadata: [],
      flatView: [],
      flatViewField: [],
    };

    let opstimisticAllFlatEntityMaps = structuredClone(fromAllFlatEntityMaps);

    if (isDefined(toAllFlatEntityMaps.flatObjectMetadataMaps)) {
      const objectResult =
        await this.workspaceMigrationBuilderV2Service.validateAndBuild({
          fromFlatObjectMetadataMaps:
            fromAllFlatEntityMaps.flatObjectMetadataMaps,
          toFlatObjectMetadataMaps: toAllFlatEntityMaps.flatObjectMetadataMaps,
          workspaceId,
          buildOptions,
        });

      opstimisticAllFlatEntityMaps = {
        ...opstimisticAllFlatEntityMaps,
        flatObjectMetadataMaps: objectResult.optimisticFlatObjectMetadataMaps,
      };

      if (objectResult.status === 'fail') {
        orchestratorFailureReport.flatObjectMetadata.push(
          ...objectResult.errors,
        );
      } else {
        allActions.push(...objectResult.workspaceMigration.actions);
      }
    }

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

      opstimisticAllFlatEntityMaps = {
        ...opstimisticAllFlatEntityMaps,
        flatViewMaps: viewResult.optimisticFlatEntityMaps,
      };

      if (viewResult.status === 'fail') {
        orchestratorFailureReport.flatView.push(...viewResult.errors);
      } else {
        allActions.push(...viewResult.actions);
      }
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

      opstimisticAllFlatEntityMaps = {
        ...opstimisticAllFlatEntityMaps,
        flatViewFieldMaps: viewFieldResult.optimisticFlatEntityMaps,
      };

      if (viewFieldResult.status === 'fail') {
        orchestratorFailureReport.flatViewField.push(...viewFieldResult.errors);
      } else {
        allActions.push(...viewFieldResult.actions);
      }
    }

    const allErrors = Object.values(orchestratorFailureReport);
    if (allErrors.some((report) => report.length > 0)) {
      return {
        status: 'fail',
        report: orchestratorFailureReport,
      };
    }

    return {
      status: 'success',
      workspaceMigration: {
        actions: allActions,
        workspaceId,
      },
    };
  }
}
