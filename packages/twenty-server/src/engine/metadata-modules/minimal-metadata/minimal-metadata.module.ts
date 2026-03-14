import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { MinimalMetadataResolver } from 'src/engine/metadata-modules/minimal-metadata/minimal-metadata.resolver';
import { MinimalMetadataService } from 'src/engine/metadata-modules/minimal-metadata/minimal-metadata.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [MinimalMetadataResolver, MinimalMetadataService],
  exports: [MinimalMetadataService],
})
export class MinimalMetadataModule {}
