import { Module } from '@nestjs/common';

import { WorkspaceFlatSkillMapCacheService } from 'src/engine/metadata-modules/flat-skill/services/workspace-flat-skill-map-cache.service';

@Module({
  providers: [WorkspaceFlatSkillMapCacheService],
  exports: [WorkspaceFlatSkillMapCacheService],
})
export class FlatSkillModule {}
