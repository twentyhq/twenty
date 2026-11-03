import { type AgentChatAssistantReplyContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-reply-context.type';
import { buildAgentChatAssistantReplyProviderMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-assistant-reply-provider-metadata.util';
import { Injectable } from '@nestjs/common';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { FileFolder } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { In, Like } from 'typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type AgentChatMemberMessage } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-member-message.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class AgentChatMemberMessagePartsService {
  constructor(
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
  ) {}

  async build({
    workspaceId,
    message: { text, attachments },
    assistantReplyContext,
  }: {
    workspaceId: string;
    message: AgentChatMemberMessage;
    assistantReplyContext?: AgentChatAssistantReplyContext;
  }): Promise<ExtendedUIMessagePart[]> {
    const textPart: ExtendedUIMessagePart = {
      type: 'text',
      text,
      providerMetadata: buildAgentChatAssistantReplyProviderMetadata(
        assistantReplyContext,
      ),
    };

    if (!isNonEmptyArray(attachments)) {
      return [textPart];
    }

    const files = await this.fileRepository.find(workspaceId, {
      where: {
        id: In(attachments.map(({ id }) => id)),
        path: Like(`${FileFolder.AgentChat}/%`),
      },
    });
    const filesById = new Map(files.map((file) => [file.id, file]));

    return [
      textPart,
      ...attachments
        .filter(({ id }) => filesById.has(id))
        .map(({ id, filename }) => ({
          type: 'file' as const,
          fileId: id,
          filename,
          mediaType: filesById.get(id)?.mimeType ?? 'application/octet-stream',
          url: '',
        })),
    ];
  }
}
