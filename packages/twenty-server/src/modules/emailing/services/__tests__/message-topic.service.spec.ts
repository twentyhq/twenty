import { type MessageTopicEntity } from 'src/engine/core-modules/emailing-domain/message-topic.entity';
import { MessageTopicVisibility } from 'src/engine/core-modules/emailing-domain/types/message-topic-visibility.type';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { MessageTopicService } from 'src/modules/emailing/services/message-topic.service';

const WORKSPACE_ID = 'workspace-1';

describe('MessageTopicService', () => {
  const setUp = ({
    existing,
  }: { existing?: Partial<MessageTopicEntity> } = {}) => {
    const repository = {
      find: jest.fn().mockResolvedValue([]),
      save: jest
        .fn()
        .mockImplementation((_workspaceId, entity) =>
          Promise.resolve({ id: 'topic-new', ...entity }),
        ),
      findOneOrFail: jest.fn().mockResolvedValue(existing ?? null),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const service = new MessageTopicService(
      repository as unknown as WorkspaceScopedRepository<MessageTopicEntity>,
    );

    return { service, repository };
  };

  describe('createMessageTopic', () => {
    it('defaults visibility to PRIVATE when none is given', async () => {
      const { service, repository } = setUp();

      await service.createMessageTopic(WORKSPACE_ID, { name: 'Newsletter' });

      expect(repository.save).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({
          name: 'Newsletter',
          visibility: MessageTopicVisibility.PRIVATE,
        }),
      );
    });

    it('uses the provided visibility', async () => {
      const { service, repository } = setUp();

      await service.createMessageTopic(WORKSPACE_ID, {
        name: 'Product updates',
        visibility: MessageTopicVisibility.PUBLIC,
      });

      expect(repository.save).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({
          visibility: MessageTopicVisibility.PUBLIC,
        }),
      );
    });
  });

  describe('updateMessageTopic', () => {
    it('merges only the provided fields onto the existing topic', async () => {
      const existing = {
        id: 'topic-1',
        name: 'Old name',
        description: 'Keep me',
        visibility: MessageTopicVisibility.PRIVATE,
      };
      const { service, repository } = setUp({ existing });

      await service.updateMessageTopic(WORKSPACE_ID, {
        id: 'topic-1',
        name: 'New name',
      });

      expect(repository.findOneOrFail).toHaveBeenCalledWith(WORKSPACE_ID, {
        where: { id: 'topic-1' },
      });
      // description and visibility are untouched; only name changes.
      expect(repository.save).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({
          id: 'topic-1',
          name: 'New name',
          description: 'Keep me',
          visibility: MessageTopicVisibility.PRIVATE,
        }),
      );
    });
  });

  describe('deleteMessageTopic', () => {
    it('deletes by id, scoped to the workspace', async () => {
      const { service, repository } = setUp();

      await service.deleteMessageTopic(WORKSPACE_ID, 'topic-1');

      expect(repository.delete).toHaveBeenCalledWith(WORKSPACE_ID, {
        id: 'topic-1',
      });
    });
  });

  describe('findPublicTopics', () => {
    it('filters to PUBLIC visibility, ordered by name', async () => {
      const { service, repository } = setUp();

      await service.findPublicTopics(WORKSPACE_ID);

      expect(repository.find).toHaveBeenCalledWith(WORKSPACE_ID, {
        where: { visibility: MessageTopicVisibility.PUBLIC },
        order: { name: 'ASC' },
      });
    });
  });

  describe('getMessageTopics', () => {
    it('lists every topic, ordered by name', async () => {
      const { service, repository } = setUp();

      await service.getMessageTopics(WORKSPACE_ID);

      expect(repository.find).toHaveBeenCalledWith(WORKSPACE_ID, {
        order: { name: 'ASC' },
      });
    });
  });
});
