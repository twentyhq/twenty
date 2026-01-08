import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type Sources } from 'twenty-shared/types';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { ServerlessService } from 'src/engine/core-modules/serverless/serverless.service';
import { getServerlessFolder } from 'src/engine/core-modules/serverless/utils/serverless-get-folder.utils';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { UpdateServerlessFunctionAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/serverless-function/types/workspace-migration-serverless-function-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateServerlessFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'serverlessFunction',
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
    const { entityId, code } = action;

    const serverlessFunctionRepository =
      queryRunner.manager.getRepository<ServerlessFunctionEntity>(
        ServerlessFunctionEntity,
      );

    await serverlessFunctionRepository.update(
      entityId,
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action),
    );

    const serverlessFunction = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: entityId,
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
      serverlessFunction as unknown as ServerlessFunctionEntity,
    );
  }

  async handleChecksumUpdate({
    serverlessFunction,
    code,
  }: {
    serverlessFunction: FlatServerlessFunction;
    code: Sources;
  }) {
    const fileFolder = getServerlessFolder({
      serverlessFunction,
      version: 'draft',
    });

    await this.fileStorageService.writeFolder(code, fileFolder);
  }
}
