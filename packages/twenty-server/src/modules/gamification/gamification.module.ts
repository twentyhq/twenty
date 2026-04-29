import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardEntryEntity, BadgeEntity, SalesChallengeEntity } from './gamification.entity';
import { GamificationService } from './gamification.service';

@Module({
  imports: [TypeOrmModule.forFeature([LeaderboardEntryEntity, BadgeEntity, SalesChallengeEntity])],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
