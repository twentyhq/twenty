import { BadRequestException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { GamificationService } from 'src/modules/gamification/services/gamification.service';

describe('GamificationService', () => {
  let service: GamificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GamificationService],
    }).compile();

    service = module.get(GamificationService);
  });

  it('sorts leaderboard by points and assigns ranks', () => {
    const result = service.calculateLeaderboard([
      {
        id: 'user-a',
        name: 'Alice',
        dealsWon: 2,
        revenue: 3000000,
        badgeCount: 1,
      },
      {
        id: 'user-b',
        name: 'Bob',
        dealsWon: 1,
        revenue: 10000000,
        badgeCount: 3,
      },
    ]);

    expect(result).toEqual([
      {
        rank: 1,
        userId: 'user-b',
        userName: 'Bob',
        points: 260,
        dealsWon: 1,
        revenue: 10000000,
        badges: 3,
      },
      {
        rank: 2,
        userId: 'user-a',
        userName: 'Alice',
        points: 253,
        dealsWon: 2,
        revenue: 3000000,
        badges: 1,
      },
    ]);
  });

  it('evaluates achievements for supported badge types', () => {
    const result = service.checkAchievements(
      {
        dealsWon: 7,
        revenue: 2500000,
        dealsCreated: 12,
        ticketsResolved: 60,
      },
      [
        { type: 'DEALS_WON', criteria: '5' },
        { type: 'REVENUE', criteria: '5000000' },
      ],
    );

    expect(result).toEqual([
      {
        badgeId: '5',
        badgeName: 'DEALS_WON',
        earned: true,
        progress: 5,
        requirement: 5,
      },
      {
        badgeId: '5000000',
        badgeName: 'REVENUE',
        earned: false,
        progress: 2500000,
        requirement: 5000000,
      },
    ]);
  });

  it('rejects unsupported badge types', () => {
    expect(() =>
      service.checkAchievements(
        {
          dealsWon: 0,
          revenue: 0,
          dealsCreated: 0,
          ticketsResolved: 0,
        },
        [{ type: 'UNKNOWN', criteria: '1' } as never],
      ),
    ).toThrow(BadRequestException);
  });
});
