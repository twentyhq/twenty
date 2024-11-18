import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { FavoriteFolderDeletionListener } from 'src/modules/favorite-folder/listeners/favorite-folder.listener';

@Module({
  imports: [TwentyORMModule, FeatureFlagModule],
  providers: [FavoriteFolderDeletionListener],
})
export class FavoriteFolderModule {}
