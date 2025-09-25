import { Injectable } from '@nestjs/common';

import { basename, dirname, join } from 'path';

import { isDefined } from 'twenty-shared/utils';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { ServerlessService } from 'src/engine/core-modules/serverless/serverless.service';
import { getServerlessFolder } from 'src/engine/core-modules/serverless/utils/serverless-get-folder.utils';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { UpdateServerlessFunctionAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-serverless-function-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromWorkspaceMigrationUpdateActionToPartialEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-workspace-migration-update-action-to-partial-field-or-object-entity.util';

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

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<UpdateServerlessFunctionAction>): Partial<AllFlatEntityMaps> {
    const { flatServerlessFunctionMaps } = allFlatEntityMaps;
    const { serverlessFunctionId } = action;

    const existingServerlessFunction =
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: serverlessFunctionId,
        flatEntityMaps: flatServerlessFunctionMaps,
      });

    const updatedServerlessFunction = {
      ...existingServerlessFunction,
      ...fromWorkspaceMigrationUpdateActionToPartialEntity(action),
    };

    const updatedFlatServerlessFunctionMaps =
      replaceFlatEntityInFlatEntityMapsOrThrow({
        flatEntity: updatedServerlessFunction,
        flatEntityMaps: flatServerlessFunctionMaps,
      });

    return {
      flatServerlessFunctionMaps: updatedFlatServerlessFunctionMaps,
    };
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
    code: JSON;
  }) {
    const fileFolder = getServerlessFolder({
      serverlessFunction,
      version: 'draft',
    });

    for (const key of Object.keys(code)) {
      await this.fileStorageService.write({
        // @ts-expect-error legacy noImplicitAny
        file: code[key],
        name: basename(key),
        mimeType: undefined,
        folder: join(fileFolder, dirname(key)),
      });
    }
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdateServerlessFunctionAction>,
  ): Promise<void> {
    return;
  }
}
