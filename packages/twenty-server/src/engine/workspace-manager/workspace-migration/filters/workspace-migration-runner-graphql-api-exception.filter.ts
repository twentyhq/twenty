import { Catch, type ExceptionFilter, Injectable } from '@nestjs/common';

import { workspaceMigrationRunnerExceptionFormatter } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-runner-exception-formatter';
import { WorkspaceMigrationRunnerException } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

@Injectable()
@Catch(WorkspaceMigrationRunnerException)
export class WorkspaceMigrationRunnerGraphqlApiExceptionFilter
  implements ExceptionFilter
{
  catch(exception: WorkspaceMigrationRunnerException) {
    workspaceMigrationRunnerExceptionFormatter(exception);
  }
}
