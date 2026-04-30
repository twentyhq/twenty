import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { ProjectService } from '../project.service';
import {
  ProjectEntity,
  ProjectTaskEntity,
  TimeEntryEntity,
  ProjectRiskEntity,
  ProjectTemplateEntity,
  ProjectStatus,
} from '../project.entity';

describe('ProjectService', () => {
  let service: ProjectService;

  const mockProjectRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'proj-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    update: jest.fn(),
  };

  const mockTaskRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'task-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockTimeRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'time-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
    createQueryBuilder: jest.fn().mockReturnValue({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
      getMany: jest.fn().mockResolvedValue([]),
    }),
  };

  const mockRiskRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'risk-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  const mockTemplateRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'tmpl-1', ...data })),
    create: jest.fn().mockImplementation((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: getRepositoryToken(ProjectEntity), useValue: mockProjectRepo },
        { provide: getRepositoryToken(ProjectTaskEntity), useValue: mockTaskRepo },
        { provide: getRepositoryToken(TimeEntryEntity), useValue: mockTimeRepo },
        { provide: getRepositoryToken(ProjectRiskEntity), useValue: mockRiskRepo },
        { provide: getRepositoryToken(ProjectTemplateEntity), useValue: mockTemplateRepo },
      ],
    }).compile();

    service = module.get(ProjectService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFromDeal', () => {
    it('should create a project from a deal with template tasks', async () => {
      mockTemplateRepo.findOne.mockResolvedValue({
        id: 'tmpl-1',
        phases: [
          { name: 'Discovery', tasks: [{ name: 'Kickoff', estimatedHours: 4, isMilestone: true }] },
          { name: 'Build', tasks: [{ name: 'Dev', estimatedHours: 40, isMilestone: false }] },
        ],
      });

      const result = await service.createFromDeal('ws-1', 'deal-1', 'Acme Project', 'tmpl-1');

      expect(result.status).toBe(ProjectStatus.PLANNING);
      expect(mockTaskRepo.save).toHaveBeenCalledTimes(2);
    });

    it('should create a project without template', async () => {
      const result = await service.createFromDeal('ws-1', 'deal-1', 'Simple Project');

      expect(result.name).toBe('Simple Project');
      expect(mockTaskRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('completeTask', () => {
    it('should mark task as done and recalculate project progress', async () => {
      mockTaskRepo.findOne.mockResolvedValue({ id: 'task-1', projectId: 'proj-1', status: 'in_progress' });
      mockTaskRepo.find.mockResolvedValue([
        { status: 'done' },
        { status: 'done' },
      ]);

      const result = await service.completeTask('task-1');

      expect(result.status).toBe('done');
      expect(mockProjectRepo.update).toHaveBeenCalledWith('proj-1', { progressPercent: 100 });
    });

    it('should throw NotFoundException for non-existent task', async () => {
      mockTaskRepo.findOne.mockResolvedValue(null);

      await expect(service.completeTask('bad-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('logTime', () => {
    it('should log time and update project actual cost', async () => {
      mockProjectRepo.findOne.mockResolvedValue({
        id: 'proj-1', actualCost: 1000, isRetainer: false,
      });

      const result = await service.logTime('proj-1', {
        userId: 'user-1', hours: 8, date: new Date(), hourlyRate: 150,
      });

      expect(result).toHaveProperty('hours', 8);
      expect(mockProjectRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ actualCost: 2200 }),
      );
    });

    it('should throw NotFoundException for non-existent project', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);

      await expect(service.logTime('bad-id', { userId: 'u1', hours: 1, date: new Date() }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('calculateHealthScore', () => {
    it('should return green for healthy project', async () => {
      mockProjectRepo.findOne.mockResolvedValue({
        id: 'proj-1', budget: 100_000, actualCost: 50_000,
      });
      mockTaskRepo.find.mockResolvedValue([
        { status: 'done', dueDate: new Date('2026-01-01') },
        { status: 'done', dueDate: new Date('2026-02-01') },
      ]);

      const result = await service.calculateHealthScore('proj-1');

      expect(result.score).toBeGreaterThanOrEqual(70);
      expect(result.color).toBe('green');
    });

    it('should return red for over-budget project with overdue tasks', async () => {
      mockProjectRepo.findOne.mockResolvedValue({
        id: 'proj-1', budget: 50_000, actualCost: 55_000,
      });
      const pastDate = new Date('2025-01-01');
      mockTaskRepo.find.mockResolvedValue([
        { status: 'in_progress', dueDate: pastDate },
        { status: 'in_progress', dueDate: pastDate },
      ]);

      const result = await service.calculateHealthScore('proj-1');

      expect(result.score).toBeLessThan(40);
      expect(result.color).toBe('red');
    });
  });
});
