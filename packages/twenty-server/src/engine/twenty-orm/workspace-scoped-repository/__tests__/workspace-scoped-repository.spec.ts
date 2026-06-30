import { type Repository } from 'typeorm';

import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
type FakeEntity = {
  id: string;
  status: string;
  workspaceId: string;
  [key: string]: unknown;
};

const WORKSPACE_ID = 'workspace-1';
const OTHER_WORKSPACE_ID = 'workspace-2';

const createMockRepository = (): jest.Mocked<Repository<FakeEntity>> =>
  ({
    findOne: jest.fn().mockResolvedValue(null),
    findOneOrFail: jest.fn(),
    findOneBy: jest.fn().mockResolvedValue(null),
    find: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    exists: jest.fn().mockResolvedValue(false),
    existsBy: jest.fn().mockResolvedValue(false),
    maximum: jest.fn().mockResolvedValue(null),
    update: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    insert: jest.fn(),
    upsert: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  }) as unknown as jest.Mocked<Repository<FakeEntity>>;

describe('WorkspaceScopedRepository', () => {
  let repository: jest.Mocked<Repository<FakeEntity>>;
  let scoped: WorkspaceScopedRepository<FakeEntity>;

  beforeEach(() => {
    repository = createMockRepository();
    scoped = new WorkspaceScopedRepository(repository);
  });

  describe('workspaceId guard', () => {
    // TypeORM drops `undefined` values from WHERE/criteria, so a
    // missing workspaceId would otherwise produce an unscoped query.
    // Each public method must trip before reaching the repository.
    it.each([
      ['findOne', () => scoped.findOne(undefined as never, { where: {} })],
      [
        'findOneOrFail',
        () => scoped.findOneOrFail(undefined as never, { where: {} }),
      ],
      ['findOneBy', () => scoped.findOneBy(undefined as never, {})],
      ['find', () => scoped.find(undefined as never)],
      ['count', () => scoped.count(undefined as never)],
      ['findAndCount', () => scoped.findAndCount(undefined as never)],
      ['exists', () => scoped.exists(undefined as never)],
      ['existsBy', () => scoped.existsBy(undefined as never, {})],
      ['update', () => scoped.update(undefined as never, {}, {})],
      ['increment', () => scoped.increment(undefined as never, {}, 'count', 1)],
      ['decrement', () => scoped.decrement(undefined as never, {}, 'count', 1)],
      ['delete', () => scoped.delete(undefined as never, {})],
      ['softDelete', () => scoped.softDelete(undefined as never, {})],
      ['insert', () => scoped.insert(undefined as never, {})],
      ['upsert', () => scoped.upsert(undefined as never, {}, ['id'])],
      [
        'upsertAndReturnOne',
        () => scoped.upsertAndReturnOne(undefined as never, {}, ['id']),
      ],
      ['save', () => scoped.save(undefined as never, {})],
      ['saveMany', () => scoped.saveMany(undefined as never, [{}])],
      ['maximum', () => scoped.maximum(undefined as never, 'id')],
    ])('%s throws when workspaceId is undefined', (_name, call) => {
      expect(call).toThrow(/workspaceId must be a non-empty string/);
    });

    it.each([null, ''])('throws when workspaceId is %p', (badWorkspaceId) => {
      expect(() =>
        scoped.findOne(badWorkspaceId as never, { where: {} }),
      ).toThrow(/workspaceId must be a non-empty string/);
    });
  });

  describe('findOne', () => {
    it('merges workspaceId into a plain where clause', async () => {
      await scoped.findOne(WORKSPACE_ID, { where: { id: 'a' } });

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'a', workspaceId: WORKSPACE_ID },
      });
    });

    it('merges workspaceId into every clause of an OR (array) where', async () => {
      await scoped.findOne(WORKSPACE_ID, {
        where: [{ id: 'a' }, { status: 'queued' }],
      });

      expect(repository.findOne).toHaveBeenCalledWith({
        where: [
          { id: 'a', workspaceId: WORKSPACE_ID },
          { status: 'queued', workspaceId: WORKSPACE_ID },
        ],
      });
    });

    it('throws if the caller includes workspaceId in the WHERE clause', () => {
      expect(() =>
        scoped.findOne(WORKSPACE_ID, {
          where: { id: 'a', workspaceId: OTHER_WORKSPACE_ID } as never,
        }),
      ).toThrow(/do not include `workspaceId`/);

      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('throws if any clause of an array WHERE includes workspaceId', () => {
      expect(() =>
        scoped.findOne(WORKSPACE_ID, {
          where: [
            { id: 'a' },
            { id: 'b', workspaceId: OTHER_WORKSPACE_ID } as never,
          ],
        }),
      ).toThrow(/do not include `workspaceId`/);
    });

    it('places workspaceId first in the merged WHERE clause', async () => {
      await scoped.findOne(WORKSPACE_ID, {
        where: { id: 'a', status: 'queued' },
      });

      const callArg = repository.findOne.mock.calls[0][0];
      const whereKeys = Object.keys(
        (callArg as { where: Record<string, unknown> }).where,
      );

      expect(whereKeys[0]).toBe('workspaceId');
    });

    it('preserves relations and other options', async () => {
      await scoped.findOne(WORKSPACE_ID, {
        where: { id: 'a' },
        relations: ['messages'],
        select: ['id'],
      });

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'a', workspaceId: WORKSPACE_ID },
        relations: ['messages'],
        select: ['id'],
      });
    });
  });

  describe('findOneBy', () => {
    it('merges workspaceId into where', async () => {
      await scoped.findOneBy(WORKSPACE_ID, { id: 'a' });

      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: 'a',
        workspaceId: WORKSPACE_ID,
      });
    });

    it('throws if the caller includes workspaceId in where', () => {
      expect(() =>
        scoped.findOneBy(WORKSPACE_ID, {
          id: 'a',
          workspaceId: OTHER_WORKSPACE_ID,
        } as never),
      ).toThrow(/do not include `workspaceId`/);

      expect(repository.findOneBy).not.toHaveBeenCalled();
    });
  });

  describe('find', () => {
    it('adds workspaceId when no where is provided', async () => {
      await scoped.find(WORKSPACE_ID);

      expect(repository.find).toHaveBeenCalledWith({
        where: { workspaceId: WORKSPACE_ID },
      });
    });

    it('merges workspaceId into provided where', async () => {
      await scoped.find(WORKSPACE_ID, { where: { status: 'queued' } });

      expect(repository.find).toHaveBeenCalledWith({
        where: { status: 'queued', workspaceId: WORKSPACE_ID },
      });
    });
  });

  describe('findAndCount', () => {
    it('merges workspaceId into where', async () => {
      await scoped.findAndCount(WORKSPACE_ID, { where: { status: 'queued' } });

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { status: 'queued', workspaceId: WORKSPACE_ID },
      });
    });

    it('works without options', async () => {
      await scoped.findAndCount(WORKSPACE_ID);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { workspaceId: WORKSPACE_ID },
      });
    });
  });

  describe('exists', () => {
    it('merges workspaceId into where', async () => {
      await scoped.exists(WORKSPACE_ID, { where: { status: 'queued' } });

      expect(repository.exists).toHaveBeenCalledWith({
        where: { status: 'queued', workspaceId: WORKSPACE_ID },
      });
    });

    it('works without options', async () => {
      await scoped.exists(WORKSPACE_ID);

      expect(repository.exists).toHaveBeenCalledWith({
        where: { workspaceId: WORKSPACE_ID },
      });
    });
  });

  describe('existsBy', () => {
    it('merges workspaceId into where', async () => {
      await scoped.existsBy(WORKSPACE_ID, { id: 'a' });

      expect(repository.existsBy).toHaveBeenCalledWith({
        id: 'a',
        workspaceId: WORKSPACE_ID,
      });
    });
  });

  describe('update', () => {
    it('merges workspaceId into the criteria, not the patch', async () => {
      await scoped.update(WORKSPACE_ID, { id: 'a' }, { status: 'completed' });

      expect(repository.update).toHaveBeenCalledWith(
        { id: 'a', workspaceId: WORKSPACE_ID },
        { status: 'completed' },
      );
    });

    it('throws if the caller includes workspaceId in the criteria', () => {
      expect(() =>
        scoped.update(
          WORKSPACE_ID,
          { id: 'a', workspaceId: OTHER_WORKSPACE_ID } as never,
          { status: 'completed' },
        ),
      ).toThrow(/do not include `workspaceId`/);

      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('increment and decrement', () => {
    it('increment merges workspaceId into criteria', async () => {
      await scoped.increment(WORKSPACE_ID, { id: 'a' }, 'count', 1);

      expect(repository.increment).toHaveBeenCalledWith(
        { id: 'a', workspaceId: WORKSPACE_ID },
        'count',
        1,
      );
    });

    it('increment throws if the caller includes workspaceId in the criteria', () => {
      expect(() =>
        scoped.increment(
          WORKSPACE_ID,
          { id: 'a', workspaceId: OTHER_WORKSPACE_ID } as never,
          'count',
          1,
        ),
      ).toThrow(/do not include `workspaceId`/);

      expect(repository.increment).not.toHaveBeenCalled();
    });

    it('decrement merges workspaceId into criteria', async () => {
      await scoped.decrement(WORKSPACE_ID, { id: 'a' }, 'count', 1);

      expect(repository.decrement).toHaveBeenCalledWith(
        { id: 'a', workspaceId: WORKSPACE_ID },
        'count',
        1,
      );
    });
  });

  describe('delete and softDelete', () => {
    it('delete merges workspaceId into criteria', async () => {
      await scoped.delete(WORKSPACE_ID, { id: 'a' });

      expect(repository.delete).toHaveBeenCalledWith({
        id: 'a',
        workspaceId: WORKSPACE_ID,
      });
    });

    it('softDelete merges workspaceId into criteria', async () => {
      await scoped.softDelete(WORKSPACE_ID, { id: 'a' });

      expect(repository.softDelete).toHaveBeenCalledWith({
        id: 'a',
        workspaceId: WORKSPACE_ID,
      });
    });
  });

  describe('insert', () => {
    it('stamps workspaceId on a single entity', async () => {
      await scoped.insert(WORKSPACE_ID, { id: 'a', status: 'queued' });

      expect(repository.insert).toHaveBeenCalledWith({
        id: 'a',
        status: 'queued',
        workspaceId: WORKSPACE_ID,
      });
    });

    it('stamps workspaceId on each entity in an array', async () => {
      await scoped.insert(WORKSPACE_ID, [
        { id: 'a', status: 'queued' },
        { id: 'b', status: 'sent' },
      ]);

      expect(repository.insert).toHaveBeenCalledWith([
        { id: 'a', status: 'queued', workspaceId: WORKSPACE_ID },
        { id: 'b', status: 'sent', workspaceId: WORKSPACE_ID },
      ]);
    });

    it('overrides caller-supplied workspaceId on the entity', async () => {
      await scoped.insert(WORKSPACE_ID, {
        id: 'a',
        workspaceId: OTHER_WORKSPACE_ID,
      });

      expect(repository.insert).toHaveBeenCalledWith({
        id: 'a',
        workspaceId: WORKSPACE_ID,
      });
    });
  });

  describe('upsert', () => {
    it('stamps workspaceId on a single entity and forwards conflict opts', async () => {
      await scoped.upsert(WORKSPACE_ID, { id: 'a', status: 'queued' }, ['id']);

      expect(repository.upsert).toHaveBeenCalledWith(
        { id: 'a', status: 'queued', workspaceId: WORKSPACE_ID },
        ['id'],
      );
    });

    it('stamps workspaceId on each entity in an array', async () => {
      await scoped.upsert(
        WORKSPACE_ID,
        [
          { id: 'a', status: 'queued' },
          { id: 'b', status: 'sent' },
        ],
        { conflictPaths: ['id'] },
      );

      expect(repository.upsert).toHaveBeenCalledWith(
        [
          { id: 'a', status: 'queued', workspaceId: WORKSPACE_ID },
          { id: 'b', status: 'sent', workspaceId: WORKSPACE_ID },
        ],
        { conflictPaths: ['id'] },
      );
    });
  });

  describe('upsertAndReturnOne', () => {
    it('upserts with RETURNING and hydrates the row from generatedMaps', async () => {
      const persistedRow = {
        id: 'a',
        status: 'queued',
        workspaceId: WORKSPACE_ID,
      };

      (repository.upsert as jest.Mock).mockResolvedValue({
        generatedMaps: [persistedRow],
      });
      (repository.create as jest.Mock).mockReturnValue(persistedRow);

      const result = await scoped.upsertAndReturnOne(
        WORKSPACE_ID,
        { id: 'a', status: 'queued' },
        ['id'],
      );

      expect(repository.upsert).toHaveBeenCalledWith(
        { id: 'a', status: 'queued', workspaceId: WORKSPACE_ID },
        { conflictPaths: ['id'], returning: '*' },
      );
      expect(repository.create).toHaveBeenCalledWith(persistedRow);
      expect(result).toBe(persistedRow);
    });

    it('throws instead of returning a hollow entity when no row is returned', async () => {
      (repository.upsert as jest.Mock).mockResolvedValue({ generatedMaps: [] });

      await expect(
        scoped.upsertAndReturnOne(WORKSPACE_ID, { id: 'a' }, ['id']),
      ).rejects.toThrow(/upsert returned no row/);

      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('save', () => {
    it('stamps workspaceId on the entity passed to save', async () => {
      await scoped.save(WORKSPACE_ID, { id: 'a', status: 'queued' });

      expect(repository.save).toHaveBeenCalledWith(
        { id: 'a', status: 'queued', workspaceId: WORKSPACE_ID },
        undefined,
      );
    });

    it('saveMany stamps workspaceId on each entity', async () => {
      await scoped.saveMany(WORKSPACE_ID, [
        { id: 'a', status: 'queued' },
        { id: 'b', status: 'sent' },
      ]);

      expect(repository.save).toHaveBeenCalledWith(
        [
          { id: 'a', status: 'queued', workspaceId: WORKSPACE_ID },
          { id: 'b', status: 'sent', workspaceId: WORKSPACE_ID },
        ],
        undefined,
      );
    });

    it('overrides caller-supplied workspaceId on the entity', async () => {
      await scoped.save(WORKSPACE_ID, {
        id: 'a',
        workspaceId: OTHER_WORKSPACE_ID,
      });

      expect(repository.save).toHaveBeenCalledWith(
        { id: 'a', workspaceId: WORKSPACE_ID },
        undefined,
      );
    });
  });

  describe('count', () => {
    it('merges workspaceId into where', async () => {
      await scoped.count(WORKSPACE_ID, { where: { status: 'queued' } });

      expect(repository.count).toHaveBeenCalledWith({
        where: { status: 'queued', workspaceId: WORKSPACE_ID },
      });
    });

    it('adds workspaceId when no options are provided', async () => {
      await scoped.count(WORKSPACE_ID);

      expect(repository.count).toHaveBeenCalledWith({
        where: { workspaceId: WORKSPACE_ID },
      });
    });
  });

  describe('maximum', () => {
    it('calls with scoped criteria when where is provided', async () => {
      await scoped.maximum(WORKSPACE_ID, 'id', { status: 'queued' });

      expect(repository.maximum).toHaveBeenCalledWith('id', {
        status: 'queued',
        workspaceId: WORKSPACE_ID,
      });
    });

    it('calls with only workspaceId when no where is given', async () => {
      await scoped.maximum(WORKSPACE_ID, 'id');

      expect(repository.maximum).toHaveBeenCalledWith('id', {
        workspaceId: WORKSPACE_ID,
      });
    });
  });

  describe('createQueryBuilder', () => {
    it('returns the underlying QueryBuilder unchanged (escape hatch)', () => {
      scoped.createQueryBuilder('t');

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('t');
    });
  });

  describe('withManager', () => {
    it('returns a new wrapper bound to the manager-provided repository', async () => {
      const txRepository = createMockRepository();
      const manager = {
        getRepository: jest.fn().mockReturnValue(txRepository),
      } as unknown as import('typeorm').EntityManager;
      (repository as unknown as { target: unknown }).target = 'FakeEntity';

      const tx = scoped.withManager(manager);

      expect(tx).not.toBe(scoped);
      expect(manager.getRepository).toHaveBeenCalledWith('FakeEntity');

      await tx.findOne(WORKSPACE_ID, { where: { id: 'a' } });

      expect(txRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'a', workspaceId: WORKSPACE_ID },
      });
      expect(repository.findOne).not.toHaveBeenCalled();
    });
  });
});
