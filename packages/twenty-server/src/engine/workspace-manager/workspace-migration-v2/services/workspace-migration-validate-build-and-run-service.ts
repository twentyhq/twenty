import { Injectable, Logger } from '@nestjs/common';

import { WorkspaceMigrationBuildOrchestratorService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-build-orchestrator.service';
import {
  WorkspaceMigrationOrchestratorBuildArgs,
  WorkspaceMigrationOrchestratorFailedResult,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { WorkspaceMigrationRunnerV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/services/workspace-migration-runner-v2.service';
import {
  WorkspaceMigrationV2Exception,
  WorkspaceMigrationV2ExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration.exception';

// TODO: replace build logic by orchestrator service
@Injectable()
export class WorkspaceMigrationValidateBuildAndRunService {
  private readonly logger = new Logger(
    WorkspaceMigrationValidateBuildAndRunService.name,
  );

  constructor(
    private readonly workspaceMigrationRunnerV2Service: WorkspaceMigrationRunnerV2Service,
    private readonly workspaceMigrationBuildOrchestratorService: WorkspaceMigrationBuildOrchestratorService,
  ) {}

  public async validateBuildAndRunWorkspaceMigration(
    builderArgs: WorkspaceMigrationOrchestratorBuildArgs,
  ): Promise<WorkspaceMigrationOrchestratorFailedResult | undefined> {
    const validateAndBuildResult =
      await this.workspaceMigrationBuildOrchestratorService
        .buildWorkspaceMigration(builderArgs)
        .catch((error) => {
          this.logger.error(error);
          throw new WorkspaceMigrationV2Exception(
            WorkspaceMigrationV2ExceptionCode.BUILDER_INTERNAL_SERVER_ERROR,
            error.message,
          );
        });

    if (validateAndBuildResult.status === 'fail') {
      return validateAndBuildResult;
    }

    await this.workspaceMigrationRunnerV2Service
      .run(validateAndBuildResult.workspaceMigration)
      .catch((error) => {
        this.logger.error(error);
        throw new WorkspaceMigrationV2Exception(
          WorkspaceMigrationV2ExceptionCode.RUNNER_INTERNAL_SERVER_ERROR,
          error.message,
        );
      });

    console.log('salut');
  }
}
