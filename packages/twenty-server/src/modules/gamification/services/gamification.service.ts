import { BadRequestException, Injectable, Logger } from '@nestjs/common';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  points: number;
  dealsWon: number;
  revenue: number;
  badges: number;
}

export interface Achievement {
  badgeId: string;
  badgeName: string;
  earned: boolean;
  progress: number;
  requirement: number;
}

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  calculateLeaderboard(
    users: Array<{
      id: string;
      name: string;
      dealsWon: number;
      revenue: number;
      badgeCount: number;
    }>,
  ): LeaderboardEntry[] {
    const scored = users.map((user) => ({
      ...user,
      points: this.calculatePoints(user.dealsWon, user.revenue, user.badgeCount),
    }));

    scored.sort((a, b) => b.points - a.points);

    return scored.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      userName: user.name,
      points: user.points,
      dealsWon: user.dealsWon,
      revenue: user.revenue,
      badges: user.badgeCount,
    }));
  }

  private calculatePoints(dealsWon: number, revenue: number, badgeCount: number): number {
    const dealPoints = dealsWon * 100;
    const revenuePoints = Math.floor(revenue / 1000000);
    const badgePoints = badgeCount * 50;
    return dealPoints + revenuePoints + badgePoints;
  }

  checkAchievements(
    userStats: {
      dealsWon: number;
      revenue: number;
      dealsCreated: number;
      ticketsResolved: number;
    },
    badges: Array<{ type: string; criteria: string }>,
  ): Achievement[] {
    return badges.map((badge) => {
      let progress = 0;
      let requirement = 0;

      switch (badge.type) {
        case 'DEALS_WON':
          requirement = parseInt(badge.criteria) || 10;
          progress = userStats.dealsWon;
          break;
        case 'REVENUE':
          requirement = parseInt(badge.criteria) || 1000000;
          progress = userStats.revenue;
          break;
        case 'DEALS_CREATED':
          requirement = parseInt(badge.criteria) || 20;
          progress = userStats.dealsCreated;
          break;
        case 'TICKETS_RESOLVED':
          requirement = parseInt(badge.criteria) || 50;
          progress = userStats.ticketsResolved;
          break;
        default:
          throw new BadRequestException(`Unsupported badge type: ${badge.type}`);
      }

      return {
        badgeId: badge.criteria,
        badgeName: badge.type,
        earned: progress >= requirement,
        progress: Math.min(progress, requirement),
        requirement,
      };
    });
  }

  async notifyAchievement(userId: string, badgeName: string): Promise<void> {
    this.logger.log(`Achievement earned: ${badgeName} by user ${userId}`);
  }
}
