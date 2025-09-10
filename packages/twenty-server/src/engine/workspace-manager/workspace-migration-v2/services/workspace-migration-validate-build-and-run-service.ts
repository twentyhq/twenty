import { Injectable, Logger } from '@nestjs/common';

import {
  FailedWorkspaceMigrationBuildResult,
  WorkspaceMigrationBuildArgs,
  WorkspaceMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';
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
    private readonly workspaceMigrationBuilderV2Service: WorkspaceMigrationBuilderV2Service,
    private readonly workspaceMigrationRunnerV2Service: WorkspaceMigrationRunnerV2Service,
  ) {}

  public async validateBuildAndRunWorkspaceMigration(
    builderArgs: WorkspaceMigrationBuildArgs,
  ): Promise<FailedWorkspaceMigrationBuildResult | undefined> {
    const validateAndBuildResult = await this.workspaceMigrationBuilderV2Service
      .validateAndBuild(builderArgs)
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
  }
}
