import { Injectable } from '@nestjs/common';

import { MessageTopicEntity } from 'src/engine/core-modules/emailing-domain/message-topic.entity';
import { MessageTopicVisibility } from 'src/engine/core-modules/emailing-domain/types/message-topic-visibility.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type CreateMessageTopicArgs = {
  name: string;
  description?: string | null;
  visibility?: MessageTopicVisibility | null;
};

type UpdateMessageTopicArgs = {
  id: string;
  name?: string | null;
  description?: string | null;
  visibility?: MessageTopicVisibility | null;
};

// Unsubscribe groups, curated by the workspace admin (Settings → Email) and
// picked as a campaign's unsubscribe scope. A core entity — the public
// unsubscribe page reads it without a workspace context.
@Injectable()
export class MessageTopicService {
  constructor(
    @InjectWorkspaceScopedRepository(MessageTopicEntity)
    private readonly messageTopicRepository: WorkspaceScopedRepository<MessageTopicEntity>,
  ) {}

  async getMessageTopics(workspaceId: string): Promise<MessageTopicEntity[]> {
    return this.messageTopicRepository.find(workspaceId, {
      order: { name: 'ASC' },
    });
  }

  // Groups shown on the public unsubscribe preferences page.
  async findPublicTopics(workspaceId: string): Promise<MessageTopicEntity[]> {
    return this.messageTopicRepository.find(workspaceId, {
      where: { visibility: MessageTopicVisibility.PUBLIC },
      order: { name: 'ASC' },
    });
  }

  async createMessageTopic(
    workspaceId: string,
    { name, description = null, visibility }: CreateMessageTopicArgs,
  ): Promise<MessageTopicEntity> {
    return this.messageTopicRepository.save(workspaceId, {
      name,
      description,
      visibility: visibility ?? MessageTopicVisibility.PRIVATE,
    });
  }

  async updateMessageTopic(
    workspaceId: string,
    { id, name, description, visibility }: UpdateMessageTopicArgs,
  ): Promise<MessageTopicEntity> {
    const existing = await this.messageTopicRepository.findOneOrFail(
      workspaceId,
      { where: { id } },
    );

    return this.messageTopicRepository.save(workspaceId, {
      ...existing,
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(visibility !== undefined && visibility !== null
        ? { visibility }
        : {}),
    });
  }

  // The suppression.topicId FK cascades, so per-topic opt-outs go with it.
  async deleteMessageTopic(workspaceId: string, id: string): Promise<void> {
    await this.messageTopicRepository.delete(workspaceId, { id });
  }
}
