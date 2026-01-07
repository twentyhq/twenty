import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceFlatSkillMapCacheService } from 'src/engine/metadata-modules/flat-skill/services/workspace-flat-skill-map-cache.service';
import { SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SkillEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [WorkspaceFlatSkillMapCacheService],
  exports: [WorkspaceFlatSkillMapCacheService],
})
export class FlatSkillModule {}
