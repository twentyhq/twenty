import { Injectable } from '@nestjs/common';

import { UnsubscribeTopicEntity } from 'src/engine/core-modules/emailing-domain/unsubscribe-topic.entity';
import { UnsubscribeTopicVisibility } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-topic-visibility.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type CreateUnsubscribeTopicArgs = {
  name: string;
  description?: string | null;
  visibility?: UnsubscribeTopicVisibility | null;
};

type UpdateUnsubscribeTopicArgs = {
  id: string;
  name?: string | null;
  description?: string | null;
  visibility?: UnsubscribeTopicVisibility | null;
};

@Injectable()
export class UnsubscribeTopicService {
  constructor(
    @InjectWorkspaceScopedRepository(UnsubscribeTopicEntity)
    private readonly unsubscribeTopicRepository: WorkspaceScopedRepository<UnsubscribeTopicEntity>,
  ) {}

  async getUnsubscribeTopics(
    workspaceId: string,
  ): Promise<UnsubscribeTopicEntity[]> {
    return this.unsubscribeTopicRepository.find(workspaceId, {
      order: { name: 'ASC' },
    });
  }

  async findPublicTopics(
    workspaceId: string,
  ): Promise<UnsubscribeTopicEntity[]> {
    return this.unsubscribeTopicRepository.find(workspaceId, {
      where: { visibility: UnsubscribeTopicVisibility.PUBLIC },
      order: { name: 'ASC' },
    });
  }

  async createUnsubscribeTopic(
    workspaceId: string,
    { name, description = null, visibility }: CreateUnsubscribeTopicArgs,
  ): Promise<UnsubscribeTopicEntity> {
    return this.unsubscribeTopicRepository.save(workspaceId, {
      name,
      description,
      visibility: visibility ?? UnsubscribeTopicVisibility.PRIVATE,
    });
  }

  async updateUnsubscribeTopic(
    workspaceId: string,
    { id, name, description, visibility }: UpdateUnsubscribeTopicArgs,
  ): Promise<UnsubscribeTopicEntity> {
    const existing = await this.unsubscribeTopicRepository.findOneOrFail(
      workspaceId,
      { where: { id } },
    );

    return this.unsubscribeTopicRepository.save(workspaceId, {
      ...existing,
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(visibility !== undefined && visibility !== null
        ? { visibility }
        : {}),
    });
  }

  async deleteUnsubscribeTopic(workspaceId: string, id: string): Promise<void> {
    await this.unsubscribeTopicRepository.delete(workspaceId, { id });
  }
}
