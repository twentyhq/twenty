import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationTranslationModule } from 'src/engine/core-modules/application/application-translation/application-translation.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceTranslationCacheService } from 'src/engine/metadata-modules/workspace-translation/workspace-translation-cache.service';
import { WorkspaceTranslationEntity } from 'src/engine/metadata-modules/workspace-translation/workspace-translation.entity';
import { WorkspaceTranslationService } from 'src/engine/metadata-modules/workspace-translation/workspace-translation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceTranslationEntity]),
    ApplicationTranslationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [WorkspaceTranslationCacheService, WorkspaceTranslationService],
  exports: [WorkspaceTranslationCacheService, WorkspaceTranslationService],
})
export class WorkspaceTranslationModule {}
