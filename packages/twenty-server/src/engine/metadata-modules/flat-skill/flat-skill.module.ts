import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceFlatSkillMapCacheService } from 'src/engine/metadata-modules/flat-skill/services/workspace-flat-skill-map-cache.service';
import { SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationEntity, SkillEntity])],
  providers: [
    WorkspaceFlatSkillMapCacheService,
    provideWorkspaceScopedRepository(SkillEntity),
  ],
  exports: [WorkspaceFlatSkillMapCacheService],
})
export class FlatSkillModule {}
