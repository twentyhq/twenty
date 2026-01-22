import { Injectable } from '@nestjs/common';

import { join } from 'path';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { getSeedProjectFiles } from 'src/engine/core-modules/serverless/drivers/utils/get-seed-project-files';
import { getServerlessFolderOrThrow } from 'src/engine/core-modules/serverless/utils/get-serverless-folder-or-throw.utils';
import { ServerlessFunctionBuildService } from 'src/engine/metadata-modules/serverless-function-build/serverless-function-build.service';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { CreateServerlessFunctionAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/serverless-function/types/workspace-migration-serverless-function-action.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';

@Injectable()
export class CreateServerlessFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'serverlessFunction',
) {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly serverlessFunctionBuildService: ServerlessFunctionBuildService,
  ) {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateServerlessFunctionAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { flatEntity: serverlessFunction } = action;

    await this.buildAndSaveServerlessFunction(serverlessFunction);

    const serverlessFunctionRepository =
      queryRunner.manager.getRepository<ServerlessFunctionEntity>(
        ServerlessFunctionEntity,
      );

    await serverlessFunctionRepository.insert({
      ...serverlessFunction,
      workspaceId,
    });
  }

  private async buildAndSaveServerlessFunction(
    serverlessFunction: FlatServerlessFunction,
  ) {
    const draftFileFolder = getServerlessFolderOrThrow({
      flatServerlessFunction: serverlessFunction,
      version: 'draft',
    });

    if (isDefined(serverlessFunction?.code)) {
      await this.fileStorageService.writeFolder(
        serverlessFunction.code,
        draftFileFolder,
      );
    } else {
      for (const file of await getSeedProjectFiles) {
        await this.fileStorageService.write({
          file: file.content,
          name: file.name,
          mimeType: 'application/typescript',
          folder: join(draftFileFolder, file.path),
        });
      }
    }
    await this.serverlessFunctionBuildService.buildAndUpload({
      flatServerlessFunction: serverlessFunction,
      version: 'draft',
    });
  }

  async rollbackForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateServerlessFunctionAction>,
  ): Promise<void> {
    const { action } = context;

    await this.fileStorageService.delete({
      folderPath: getServerlessFolderOrThrow({
        flatServerlessFunction: action.flatEntity,
      }),
    });
  }
}
