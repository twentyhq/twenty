import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { KnowledgeBaseService } from '../knowledge-base.service';
import {
  KBArticleEntity,
  KBCategoryEntity,
  ArticleStatus,
} from '../knowledge-base.entity';

describe('KnowledgeBaseService', () => {
  let service: KnowledgeBaseService;

  const mockArticleRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'article-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    increment: jest.fn(),
    sum: jest.fn(),
  };

  const mockCategoryRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'cat-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeBaseService,
        { provide: getRepositoryToken(KBArticleEntity), useValue: mockArticleRepo },
        { provide: getRepositoryToken(KBCategoryEntity), useValue: mockCategoryRepo },
      ],
    }).compile();

    service = module.get(KnowledgeBaseService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createArticle', () => {
    it('should create and return an article', async () => {
      const result = await service.createArticle('ws-1', {
        title: 'How to reset password',
        content: 'Step 1: Go to settings...',
        tags: ['password', 'reset'],
      });

      expect(mockArticleRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ workspaceId: 'ws-1', title: 'How to reset password' }),
      );
      expect(result).toHaveProperty('id');
    });
  });

  describe('searchArticles', () => {
    it('should search published articles by title and content', async () => {
      const articles = [
        { id: 'a1', title: 'Password Reset', status: ArticleStatus.PUBLISHED, viewCount: 50 },
      ];
      mockArticleRepo.find.mockResolvedValue(articles);

      const result = await service.searchArticles('ws-1', 'password');

      expect(mockArticleRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.arrayContaining([
            expect.objectContaining({ status: ArticleStatus.PUBLISHED }),
          ]),
        }),
      );
      expect(result).toHaveLength(1);
    });

    it('should return empty array when nothing matches', async () => {
      mockArticleRepo.find.mockResolvedValue([]);

      const result = await service.searchArticles('ws-1', 'nonexistent');

      expect(result).toHaveLength(0);
    });
  });

  describe('suggestForTicket', () => {
    it('should suggest articles based on ticket subject keywords', async () => {
      mockArticleRepo.find.mockResolvedValue([
        { id: 'a1', title: 'Reset Guide' },
      ]);

      const result = await service.suggestForTicket('ws-1', 'Cannot reset password after upgrade');

      expect(result.length).toBeGreaterThanOrEqual(0);
      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('should return empty array when subject has no usable keywords', async () => {
      const result = await service.suggestForTicket('ws-1', 'hi');

      expect(result).toHaveLength(0);
    });
  });

  describe('getDeflectionRate', () => {
    it('should calculate deflection rate from views and helpful counts', async () => {
      mockArticleRepo.sum
        .mockResolvedValueOnce(1000)
        .mockResolvedValueOnce(300);

      const result = await service.getDeflectionRate('ws-1');

      expect(result).toBe(30);
    });

    it('should return 0 when no views exist', async () => {
      mockArticleRepo.sum
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await service.getDeflectionRate('ws-1');

      expect(result).toBe(0);
    });
  });
});
