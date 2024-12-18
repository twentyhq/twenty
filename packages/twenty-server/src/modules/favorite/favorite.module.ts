import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FavoriteDeletionJob } from 'src/modules/favorite/jobs/favorite-deletion.job';
import { FavoriteDeletionListener } from 'src/modules/favorite/listeners/favorite-deletion.listener';
import { FavoriteDeletionService } from 'src/modules/favorite/services/favorite-deletion.service';

@Module({
  imports: [FeatureFlagModule],
  providers: [
    FavoriteDeletionService,
    FavoriteDeletionListener,
    FavoriteDeletionJob,
  ],
  exports: [],
})
export class FavoriteModule {}
