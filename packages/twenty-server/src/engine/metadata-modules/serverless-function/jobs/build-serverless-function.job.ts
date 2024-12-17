import { Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { ServerlessService } from 'src/engine/core-modules/serverless/serverless.service';
import {
  ServerlessFunctionEntity,
  ServerlessFunctionSyncStatus,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { isDefined } from 'src/utils/is-defined';

export type BuildServerlessFunctionBatchEvent = {
  serverlessFunctions: {
    serverlessFunctionId: string;
    serverlessFunctionVersion: string;
  }[];
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.serverlessFunctionQueue,
  scope: Scope.REQUEST,
})
export class BuildServerlessFunctionJob {
  constructor(
    @InjectRepository(ServerlessFunctionEntity, 'metadata')
    private readonly serverlessFunctionRepository: Repository<ServerlessFunctionEntity>,
    private readonly serverlessService: ServerlessService,
  ) {}

  @Process(BuildServerlessFunctionJob.name)
  async handle(batchEvent: BuildServerlessFunctionBatchEvent): Promise<void> {
    for (const {
      serverlessFunctionId,
      serverlessFunctionVersion,
    } of batchEvent.serverlessFunctions) {
      const serverlessFunction =
        await this.serverlessFunctionRepository.findOneBy({
          id: serverlessFunctionId,
          workspaceId: batchEvent.workspaceId,
        });

      if (isDefined(serverlessFunction)) {
        await this.serverlessFunctionRepository.update(serverlessFunction.id, {
          syncStatus: ServerlessFunctionSyncStatus.NOT_READY,
        });
        await this.serverlessService.build(
          serverlessFunction,
          serverlessFunctionVersion,
        );
        await this.serverlessFunctionRepository.update(serverlessFunction.id, {
          syncStatus: ServerlessFunctionSyncStatus.READY,
        });
      }
    }
  }
}
