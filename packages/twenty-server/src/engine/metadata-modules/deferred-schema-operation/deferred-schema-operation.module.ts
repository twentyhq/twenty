import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeferredSchemaOperationEntity } from 'src/engine/metadata-modules/deferred-schema-operation/deferred-schema-operation.entity';
import { DeferredSchemaOperationService } from 'src/engine/metadata-modules/deferred-schema-operation/services/deferred-schema-operation.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeferredSchemaOperationEntity]),
    WorkspaceCacheModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    DeferredSchemaOperationService,
    provideWorkspaceScopedRepository(DeferredSchemaOperationEntity),
  ],
  exports: [DeferredSchemaOperationService],
})
export class DeferredSchemaOperationModule {}
