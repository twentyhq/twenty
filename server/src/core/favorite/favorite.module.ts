import { Module } from '@nestjs/common';
import { FavoriteResolver } from './resolvers/favorite.resolver';
import { FavoriteService } from './services/favorite.service';

@Module({
    providers: [FavoriteService, FavoriteResolver],
    exports: [FavoriteService],
})
  export class FavoriteModule {}