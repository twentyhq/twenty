import { Injectable, Logger } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import {
  FunctionMetadataEntity,
  FunctionSyncStatus,
} from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';
import { CodeEngineService } from 'src/engine/core-modules/code-engine/code-engine.service';

@Injectable()
export class WorkspaceSyncFunctionMetadataService {
  private readonly logger = new Logger(
    WorkspaceSyncFunctionMetadataService.name,
  );

  constructor(private readonly codeEngineService: CodeEngineService) {}

  async synchronize(context: WorkspaceSyncContext, manager: EntityManager) {
    const functionMetadataRepository = manager.getRepository(
      FunctionMetadataEntity,
    );
    const functionToSynchronizeCollection =
      await functionMetadataRepository.find({
        where: {
          workspaceId: context.workspaceId,
          syncStatus: FunctionSyncStatus.NOT_READY,
        },
      });

    functionToSynchronizeCollection.map(async (functionToSynchronize) => {
      await this.codeEngineService.build(functionToSynchronize);
      await functionMetadataRepository.update(functionToSynchronize.id, {
        syncStatus: FunctionSyncStatus.READY,
      });
      this.logger.log(
        `Function '${functionToSynchronize.name}' built successfully.`,
      );
    });
  }
}
