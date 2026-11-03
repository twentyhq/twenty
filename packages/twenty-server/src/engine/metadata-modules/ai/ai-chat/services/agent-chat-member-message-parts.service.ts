import { type AgentChatAssistantReplyContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-reply-context.type';
import { buildAgentChatAssistantReplyProviderMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-assistant-reply-provider-metadata.util';
import { Injectable } from '@nestjs/common';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { FileFolder } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, Like } from 'typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { type AgentChatMemberMessage } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-member-message.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class AgentChatMemberMessagePartsService {
  constructor(
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
  ) {}

  async buildMessageParts({
    workspaceId,
    message: { text, attachments },
    assistantReplyContext,
  }: {
    workspaceId: string;
    message: Pick<AgentChatMemberMessage, 'text' | 'attachments'>;
    assistantReplyContext?: AgentChatAssistantReplyContext;
  }): Promise<ExtendedUIMessagePart[]> {
    const messageTextPart: ExtendedUIMessagePart = {
      type: 'text',
      text,
      providerMetadata: buildAgentChatAssistantReplyProviderMetadata(
        assistantReplyContext,
      ),
    };

    if (!isNonEmptyArray(attachments)) {
      return [messageTextPart];
    }

    const uploadedChatFiles = await this.fileRepository.find(workspaceId, {
      where: {
        id: In(attachments.map(({ id }) => id)),
        path: Like(`${FileFolder.AgentChat}/%`),
        status: FILE_STATUS.UPLOADED,
      },
    });
    const uploadedChatFilesById = new Map(
      uploadedChatFiles.map((uploadedChatFile) => [
        uploadedChatFile.id,
        uploadedChatFile,
      ]),
    );

    return [
      messageTextPart,
      ...attachments.map(({ id, filename }) => {
        const uploadedChatFile = uploadedChatFilesById.get(id);

        if (!isDefined(uploadedChatFile)) {
          throw new AiException(
            `Attachment ${id} is not an uploaded ${FileFolder.AgentChat} file in this workspace`,
            AiExceptionCode.INVALID_AGENT_INPUT,
          );
        }

        return {
          type: 'file' as const,
          fileId: id,
          filename,
          mediaType: uploadedChatFile.mimeType,
          url: '',
        };
      }),
    ];
  }
}
