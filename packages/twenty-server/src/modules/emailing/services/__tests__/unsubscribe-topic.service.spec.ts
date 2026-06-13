import { type UnsubscribeTopicEntity } from 'src/engine/core-modules/emailing-domain/unsubscribe-topic.entity';
import { UnsubscribeTopicVisibility } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-topic-visibility.type';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { UnsubscribeTopicService } from 'src/modules/emailing/services/unsubscribe-topic.service';

const WORKSPACE_ID = 'workspace-1';

describe('UnsubscribeTopicService', () => {
  const setUp = ({
    existing,
  }: { existing?: Partial<UnsubscribeTopicEntity> } = {}) => {
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
    const service = new UnsubscribeTopicService(
      repository as unknown as WorkspaceScopedRepository<UnsubscribeTopicEntity>,
    );

    return { service, repository };
  };

  describe('createUnsubscribeTopic', () => {
    it('defaults visibility to PRIVATE when none is given', async () => {
      const { service, repository } = setUp();

      await service.createUnsubscribeTopic(WORKSPACE_ID, {
        name: 'Newsletter',
      });

      expect(repository.save).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({
          name: 'Newsletter',
          visibility: UnsubscribeTopicVisibility.PRIVATE,
        }),
      );
    });

    it('uses the provided visibility', async () => {
      const { service, repository } = setUp();

      await service.createUnsubscribeTopic(WORKSPACE_ID, {
        name: 'Product updates',
        visibility: UnsubscribeTopicVisibility.PUBLIC,
      });

      expect(repository.save).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({
          visibility: UnsubscribeTopicVisibility.PUBLIC,
        }),
      );
    });
  });

  describe('updateUnsubscribeTopic', () => {
    it('merges only the provided fields onto the existing topic', async () => {
      const existing = {
        id: 'topic-1',
        name: 'Old name',
        description: 'Keep me',
        visibility: UnsubscribeTopicVisibility.PRIVATE,
      };
      const { service, repository } = setUp({ existing });

      await service.updateUnsubscribeTopic(WORKSPACE_ID, {
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
          visibility: UnsubscribeTopicVisibility.PRIVATE,
        }),
      );
    });
  });

  describe('deleteUnsubscribeTopic', () => {
    it('deletes by id, scoped to the workspace', async () => {
      const { service, repository } = setUp();

      await service.deleteUnsubscribeTopic(WORKSPACE_ID, 'topic-1');

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
        where: { visibility: UnsubscribeTopicVisibility.PUBLIC },
        order: { name: 'ASC' },
      });
    });
  });

  describe('getUnsubscribeTopics', () => {
    it('lists every topic, ordered by name', async () => {
      const { service, repository } = setUp();

      await service.getUnsubscribeTopics(WORKSPACE_ID);

      expect(repository.find).toHaveBeenCalledWith(WORKSPACE_ID, {
        order: { name: 'ASC' },
      });
    });
  });
});
