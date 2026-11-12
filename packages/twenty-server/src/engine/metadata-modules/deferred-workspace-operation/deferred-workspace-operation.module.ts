import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeferredWorkspaceOperationEntity } from 'src/engine/metadata-modules/deferred-workspace-operation/deferred-workspace-operation.entity';
import { DeferredWorkspaceOperationQueueService } from 'src/engine/metadata-modules/deferred-workspace-operation/services/deferred-workspace-operation-queue.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

const deferredWorkspaceOperationRepositoryProvider =
  provideWorkspaceScopedRepository(DeferredWorkspaceOperationEntity);

@Module({
  imports: [TypeOrmModule.forFeature([DeferredWorkspaceOperationEntity])],
  providers: [
    deferredWorkspaceOperationRepositoryProvider,
    DeferredWorkspaceOperationQueueService,
  ],
  exports: [
    deferredWorkspaceOperationRepositoryProvider,
    DeferredWorkspaceOperationQueueService,
  ],
})
export class DeferredWorkspaceOperationModule {}
