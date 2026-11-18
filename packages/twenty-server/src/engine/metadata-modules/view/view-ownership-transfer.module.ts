import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspaceSuccessorModule } from 'src/engine/core-modules/user-workspace/user-workspace-successor.module';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewOwnershipTransferService } from 'src/engine/metadata-modules/view/services/view-ownership-transfer.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewEntity]),
    UserWorkspaceSuccessorModule,
    WorkspaceCacheModule,
  ],
  providers: [
    ViewOwnershipTransferService,
    provideWorkspaceScopedRepository(ViewEntity),
  ],
  exports: [ViewOwnershipTransferService],
})
export class ViewOwnershipTransferModule {}
