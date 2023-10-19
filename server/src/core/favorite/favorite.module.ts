import { Module } from '@nestjs/common';

import { AbilityModule } from 'src/ability/ability.module';
import { PrismaModule } from 'src/database/prisma.module';

import { FavoriteResolver } from './resolvers/favorite.resolver';
import { FavoriteService } from './services/favorite.service';

@Module({
  imports: [AbilityModule, PrismaModule],
  providers: [FavoriteService, FavoriteResolver],
  exports: [FavoriteService],
})
export class FavoriteModule {}
