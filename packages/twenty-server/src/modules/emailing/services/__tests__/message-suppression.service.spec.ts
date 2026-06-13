import { QueryFailedError } from 'typeorm';

import { type MessageSuppressionEntity } from 'src/engine/core-modules/emailing-domain/message-suppression.entity';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';
import { type MessageTopicService } from 'src/modules/emailing/services/message-topic.service';

const WORKSPACE_ID = 'workspace-1';

const buildUniqueViolation = (): QueryFailedError => {
  const error = new QueryFailedError('INSERT', [], new Error('duplicate'));

  (error as QueryFailedError & { code?: string }).code = '23505';

  return error;
};

describe('MessageSuppressionService', () => {
  const setUp = ({
    existingRows = [],
    publicTopics = [],
  }: {
    existingRows?: Partial<MessageSuppressionEntity>[];
    publicTopics?: { id: string; name: string }[];
  } = {}) => {
    const repository = {
      find: jest.fn().mockResolvedValue(existingRows),
      findOneBy: jest.fn().mockResolvedValue(existingRows[0] ?? null),
      insert: jest.fn().mockResolvedValue({ identifiers: [{ id: 'new' }] }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const messageTopicService = {
      findPublicTopics: jest.fn().mockResolvedValue(publicTopics),
    };
    const service = new MessageSuppressionService(
      repository as unknown as WorkspaceScopedRepository<MessageSuppressionEntity>,
      messageTopicService as unknown as MessageTopicService,
    );

    return { service, repository, messageTopicService };
  };

  describe('suppress', () => {
    it('inserts a normalized row when none exists', async () => {
      const { service, repository } = setUp();

      await service.suppress({
        workspaceId: WORKSPACE_ID,
        emailAddress: '  User@Example.COM ',
        reason: MessageSuppressionReason.UNSUBSCRIBE,
        source: MessageSuppressionSource.SYSTEM,
        topicId: 'topic-1',
      });

      expect(repository.insert).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({
          emailAddress: 'user@example.com',
          topicId: 'topic-1',
        }),
      );
    });

    it('records hard reasons as global blocks even when a topicId is passed', async () => {
      const { service, repository } = setUp();

      await service.suppress({
        workspaceId: WORKSPACE_ID,
        emailAddress: 'user@example.com',
        reason: MessageSuppressionReason.BOUNCE,
        source: MessageSuppressionSource.WEBHOOK,
        topicId: 'topic-1',
      });

      expect(repository.insert).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ topicId: null }),
      );
    });

    it('escalates an existing UNSUBSCRIBE to BOUNCE', async () => {
      const existing = {
        id: 'row-1',
        reason: MessageSuppressionReason.UNSUBSCRIBE,
      };
      const { service, repository } = setUp({ existingRows: [existing] });

      await service.suppress({
        workspaceId: WORKSPACE_ID,
        emailAddress: 'user@example.com',
        reason: MessageSuppressionReason.BOUNCE,
        source: MessageSuppressionSource.WEBHOOK,
      });

      expect(repository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: 'row-1' },
        expect.objectContaining({ reason: MessageSuppressionReason.BOUNCE }),
      );
      expect(repository.insert).not.toHaveBeenCalled();
    });

    it('never downgrades a hard suppression to UNSUBSCRIBE', async () => {
      const existing = {
        id: 'row-1',
        reason: MessageSuppressionReason.BOUNCE,
      };
      const { service, repository } = setUp({ existingRows: [existing] });

      await service.suppress({
        workspaceId: WORKSPACE_ID,
        emailAddress: 'user@example.com',
        reason: MessageSuppressionReason.UNSUBSCRIBE,
        source: MessageSuppressionSource.SYSTEM,
      });

      expect(repository.update).not.toHaveBeenCalled();
      expect(repository.insert).not.toHaveBeenCalled();
    });

    it('reconciles a lost insert race by re-reading instead of failing', async () => {
      const { service, repository } = setUp();
      const racedRow = {
        id: 'row-1',
        reason: MessageSuppressionReason.UNSUBSCRIBE,
      };

      // First read: nothing; insert loses the unique-index race; second read
      // finds the concurrently inserted row.
      repository.findOneBy
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(racedRow);
      repository.insert.mockRejectedValueOnce(buildUniqueViolation());

      await expect(
        service.suppress({
          workspaceId: WORKSPACE_ID,
          emailAddress: 'user@example.com',
          reason: MessageSuppressionReason.UNSUBSCRIBE,
          source: MessageSuppressionSource.SYSTEM,
        }),
      ).resolves.toBeUndefined();
    });

    it('rethrows non-unique-violation insert errors', async () => {
      const { service, repository } = setUp();

      repository.findOneBy.mockResolvedValue(null);
      repository.insert.mockRejectedValueOnce(new Error('connection reset'));

      await expect(
        service.suppress({
          workspaceId: WORKSPACE_ID,
          emailAddress: 'user@example.com',
          reason: MessageSuppressionReason.UNSUBSCRIBE,
          source: MessageSuppressionSource.SYSTEM,
        }),
      ).rejects.toThrow('connection reset');
    });
  });

  describe('getTopicSuppressedAddresses', () => {
    it('returns an empty set without querying when topicId is missing', async () => {
      const { service, repository } = setUp();

      const result = await service.getTopicSuppressedAddresses(
        WORKSPACE_ID,
        ['user@example.com'],
        undefined as unknown as string,
      );

      expect(result.size).toBe(0);
      expect(repository.find).not.toHaveBeenCalled();
    });
  });

  describe('setTopicOptOuts', () => {
    it('only writes for topics whose state changes', async () => {
      const topics = [
        { id: 'topic-kept', name: 'Kept' },
        { id: 'topic-unchecked', name: 'Unchecked' },
        { id: 'topic-rechecked', name: 'Rechecked' },
      ];
      const { service, repository } = setUp({ publicTopics: topics });

      // Existing opt-out only for topic-rechecked.
      repository.find.mockResolvedValue([{ topicId: 'topic-rechecked' }]);

      await service.setTopicOptOuts({
        workspaceId: WORKSPACE_ID,
        emailAddress: 'user@example.com',
        keptTopicIds: ['topic-kept', 'topic-rechecked'],
      });

      // topic-kept: already receiving -> no write. topic-rechecked: opt-out
      // lifted. topic-unchecked: new opt-out inserted.
      expect(repository.delete).toHaveBeenCalledTimes(1);
      expect(repository.delete).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ topicId: 'topic-rechecked' }),
      );
      expect(repository.insert).toHaveBeenCalledTimes(1);
      expect(repository.insert).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ topicId: 'topic-unchecked' }),
      );
    });
  });
});
