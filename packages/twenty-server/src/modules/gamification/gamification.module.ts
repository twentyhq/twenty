import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GamificationService } from 'src/modules/gamification/services/gamification.service';
import {
  BadgeAwardWorkspaceEntity,
  BadgeWorkspaceEntity,
} from 'src/modules/gamification/standard-objects/badge.workspace-entity';
import { GoalWorkspaceEntity } from 'src/modules/gamification/standard-objects/goal.workspace-entity';
import { UserPointsWorkspaceEntity } from 'src/modules/gamification/standard-objects/user-points.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BadgeWorkspaceEntity,
      BadgeAwardWorkspaceEntity,
      GoalWorkspaceEntity,
      UserPointsWorkspaceEntity,
      WorkspaceMemberWorkspaceEntity,
    ]),
  ],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
