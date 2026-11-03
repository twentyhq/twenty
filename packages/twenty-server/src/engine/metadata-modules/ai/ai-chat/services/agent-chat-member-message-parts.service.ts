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

  async build({
    workspaceId,
    message: { text, attachments },
  }: {
    workspaceId: string;
    message: Pick<AgentChatMemberMessage, 'text' | 'attachments'>;
  }): Promise<ExtendedUIMessagePart[]> {
    const textPart: ExtendedUIMessagePart = { type: 'text', text };

    if (!isNonEmptyArray(attachments)) {
      return [textPart];
    }

    const files = await this.fileRepository.find(workspaceId, {
      where: {
        id: In(attachments.map(({ id }) => id)),
        path: Like(`${FileFolder.AgentChat}/%`),
        status: FILE_STATUS.UPLOADED,
      },
    });
    const filesById = new Map(files.map((file) => [file.id, file]));

    return [
      textPart,
      ...attachments.map(({ id, filename }) => {
        const file = filesById.get(id);

        if (!isDefined(file)) {
          throw new AiException(
            `Attachment ${id} is not an uploaded ${FileFolder.AgentChat} file in this workspace`,
            AiExceptionCode.INVALID_AGENT_INPUT,
          );
        }

        return {
          type: 'file' as const,
          fileId: id,
          filename,
          mediaType: file.mimeType,
          url: '',
        };
      }),
    ];
  }
}
