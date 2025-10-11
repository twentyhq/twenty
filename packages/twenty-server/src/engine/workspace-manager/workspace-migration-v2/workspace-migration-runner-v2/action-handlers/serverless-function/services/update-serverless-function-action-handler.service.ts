import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { ServerlessService } from 'src/engine/core-modules/serverless/serverless.service';
import { getServerlessFolder } from 'src/engine/core-modules/serverless/utils/serverless-get-folder.utils';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { UpdateServerlessFunctionAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-serverless-function-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromWorkspaceMigrationUpdateActionToPartialEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-workspace-migration-update-action-to-partial-field-or-object-entity.util';
import { ServerlessFunctionCode } from 'src/engine/metadata-modules/serverless-function/types/serverless-function-code.type';

@Injectable()
export class UpdateServerlessFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_serverless_function',
) {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly serverlessService: ServerlessService,
  ) {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateServerlessFunctionAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { serverlessFunctionId, code } = action;

    const serverlessFunctionRepository =
      queryRunner.manager.getRepository<ServerlessFunctionEntity>(
        ServerlessFunctionEntity,
      );

    await serverlessFunctionRepository.update(
      serverlessFunctionId,
      fromWorkspaceMigrationUpdateActionToPartialEntity(action),
    );

    const serverlessFunction = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: serverlessFunctionId,
      flatEntityMaps: context.allFlatEntityMaps.flatServerlessFunctionMaps,
    });

    for (const update of action.updates) {
      if (update.property === 'checksum' && isDefined(code)) {
        await this.handleChecksumUpdate({
          serverlessFunction,
          code,
        });
      }
      if (update.property === 'deletedAt' && isDefined(update.to)) {
        await this.handleDeletedAtUpdate({
          serverlessFunction,
        });
      }
    }
  }

  async handleDeletedAtUpdate({
    serverlessFunction,
  }: {
    serverlessFunction: FlatServerlessFunction;
  }) {
    this.serverlessService.delete(
      serverlessFunction as ServerlessFunctionEntity,
    );
  }

  async handleChecksumUpdate({
    serverlessFunction,
    code,
  }: {
    serverlessFunction: FlatServerlessFunction;
    code: ServerlessFunctionCode;
  }) {
    const fileFolder = getServerlessFolder({
      serverlessFunction,
      version: 'draft',
    });

    await this.fileStorageService.writeFolder(code, fileFolder);
  }
}
