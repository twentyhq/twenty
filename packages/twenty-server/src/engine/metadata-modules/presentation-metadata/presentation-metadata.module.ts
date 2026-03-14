import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PresentationMetadataResolver } from 'src/engine/metadata-modules/presentation-metadata/presentation-metadata.resolver';
import { PresentationMetadataService } from 'src/engine/metadata-modules/presentation-metadata/presentation-metadata.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [PresentationMetadataResolver, PresentationMetadataService],
  exports: [PresentationMetadataService],
})
export class PresentationMetadataModule {}
