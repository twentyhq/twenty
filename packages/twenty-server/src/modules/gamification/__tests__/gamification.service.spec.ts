import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { GamificationService } from '../gamification.service';
import {
  LeaderboardEntryEntity,
  BadgeEntity,
  SalesChallengeEntity,
  BadgeType,
} from '../gamification.entity';

describe('GamificationService', () => {
  let service: GamificationService;

  const mockLeaderboardRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'lb-1', ...data })),
    create: jest.fn().mockImplementation((data) => ({
      dealsWon: 0, revenue: 0, activitiesCompleted: 0, points: 0, ...data,
    })),
  };

  const mockBadgeRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'badge-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockChallengeRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'ch-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        { provide: getRepositoryToken(LeaderboardEntryEntity), useValue: mockLeaderboardRepo },
        { provide: getRepositoryToken(BadgeEntity), useValue: mockBadgeRepo },
        { provide: getRepositoryToken(SalesChallengeEntity), useValue: mockChallengeRepo },
      ],
    }).compile();

    service = module.get(GamificationService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordActivity', () => {
    it('should create a new entry when none exists for the period', async () => {
      mockLeaderboardRepo.findOne.mockResolvedValue(null);

      const result = await service.recordActivity('ws-1', 'user-1', '2026-Q1', {
        dealsWon: 3, revenue: 50_000, points: 100,
      });

      expect(result.dealsWon).toBe(3);
      expect(result.points).toBe(100);
    });

    it('should accumulate values on existing entry', async () => {
      mockLeaderboardRepo.findOne.mockResolvedValue({
        id: 'lb-1', dealsWon: 5, revenue: 100_000, activitiesCompleted: 20, points: 200,
      });

      const result = await service.recordActivity('ws-1', 'user-1', '2026-Q1', {
        dealsWon: 2, points: 50,
      });

      expect(result.dealsWon).toBe(7);
      expect(result.points).toBe(250);
    });
  });

  describe('getLeaderboard', () => {
    it('should return entries sorted by points with rank assigned', async () => {
      mockLeaderboardRepo.find.mockResolvedValue([
        { id: 'lb-1', userId: 'u1', points: 300 },
        { id: 'lb-2', userId: 'u2', points: 200 },
        { id: 'lb-3', userId: 'u3', points: 100 },
      ]);

      const result = await service.getLeaderboard('ws-1', '2026-Q1');

      expect(result).toHaveLength(3);
      expect(result[0].rank).toBe(1);
      expect(result[1].rank).toBe(2);
      expect(result[2].rank).toBe(3);
    });

    it('should return empty array when no entries exist', async () => {
      mockLeaderboardRepo.find.mockResolvedValue([]);

      const result = await service.getLeaderboard('ws-1', '2026-Q1');

      expect(result).toHaveLength(0);
    });
  });

  describe('awardBadge', () => {
    it('should award a new badge', async () => {
      mockBadgeRepo.findOne.mockResolvedValue(null);

      const result = await service.awardBadge('ws-1', 'user-1', BadgeType.DEALS_WON, 'Closer 5');

      expect(mockBadgeRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: BadgeType.DEALS_WON, name: 'Closer 5' }),
      );
      expect(result).toHaveProperty('id');
    });

    it('should return existing badge without duplicating', async () => {
      const existing = { id: 'badge-existing', name: 'Closer 5' };
      mockBadgeRepo.findOne.mockResolvedValue(existing);

      const result = await service.awardBadge('ws-1', 'user-1', BadgeType.DEALS_WON, 'Closer 5');

      expect(result).toBe(existing);
      expect(mockBadgeRepo.save).not.toHaveBeenCalled();
    });
  });
});
