import { Injectable } from '@nestjs/common';

import { join } from 'path';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { getBaseTypescriptProjectFiles } from 'src/engine/core-modules/serverless/drivers/utils/get-base-typescript-project-files';
import { getServerlessFolder } from 'src/engine/core-modules/serverless/utils/serverless-get-folder.utils';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { CreateServerlessFunctionAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/serverless-function/types/workspace-migration-serverless-function-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateServerlessFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'serverlessFunction',
) {
  constructor(private readonly fileStorageService: FileStorageService) {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateServerlessFunctionAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { flatEntity: serverlessFunction } = action;

    const serverlessFunctionRepository =
      queryRunner.manager.getRepository<ServerlessFunctionEntity>(
        ServerlessFunctionEntity,
      );

    await serverlessFunctionRepository.insert({
      ...serverlessFunction,
      workspaceId,
    });

    const draftFileFolder = getServerlessFolder({
      serverlessFunction,
      version: 'draft',
    });

    if (isDefined(serverlessFunction?.code)) {
      await this.fileStorageService.writeFolder(
        serverlessFunction.code,
        draftFileFolder,
      );
    } else {
      for (const file of await getBaseTypescriptProjectFiles) {
        await this.fileStorageService.write({
          file: file.content,
          name: file.name,
          mimeType: undefined,
          folder: join(draftFileFolder, file.path),
        });
      }
    }
  }

  async rollbackForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateServerlessFunctionAction>,
  ): Promise<void> {
    const { action } = context;

    await this.fileStorageService.delete({
      folderPath: getServerlessFolder({
        serverlessFunction: action.flatEntity,
      }),
    });
  }
}
