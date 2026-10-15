import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { MorphRelationReferenceVisibilityService } from 'src/engine/metadata-modules/morph-relation-head/services/morph-relation-reference-visibility.service';

@Module({
  imports: [FeatureFlagModule, WorkspaceManyOrAllFlatEntityMapsCacheModule],
  providers: [MorphRelationReferenceVisibilityService],
  exports: [MorphRelationReferenceVisibilityService],
})
export class MorphRelationHeadModule {}
