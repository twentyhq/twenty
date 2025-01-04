import { Module } from '@nestjs/common';

import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { FavoriteFolderDeletionListener } from 'src/modules/favorite-folder/listeners/favorite-folder.listener';

@Module({
  imports: [TwentyORMModule],
  providers: [FavoriteFolderDeletionListener],
})
export class FavoriteFolderModule {}
