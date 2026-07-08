import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { ImportedMessageDTO } from 'src/modules/messaging/message-import-manager/dtos/import-messages-output.dto';
import { type ImportMessagesInput } from 'src/modules/messaging/message-import-manager/dtos/import-messages.input';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

@Injectable()
export class MessagingImportMessagesService {
  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly saveMessagesAndEnqueueContactCreationService: MessagingSaveMessagesAndEnqueueContactCreationService,
  ) {}

  async importMessages({
    input,
    workspaceId,
  }: {
    input: ImportMessagesInput;
    workspaceId: string;
  }): Promise<ImportedMessageDTO[]> {
    const messageChannel = await this.messageChannelRepository.findOneOrFail({
      where: {
        id: input.messageChannelId,
        workspaceId,
      },
      relations: { connectedAccount: true },
    });

    const messagesToSave: MessageWithParticipants[] = input.messages.map(
      (message) => ({
        externalId: message.externalId,
        messageThreadExternalId: message.messageThreadExternalId,
        headerMessageId: message.headerMessageId ?? null,
        subject: message.subject ?? null,
        text: message.text,
        receivedAt: message.receivedAt,
        direction: message.direction,
        attachments: [],
        isDraft: false,
        participants: message.participants.map((participant) => ({
          role: participant.role,
          handle: participant.handle,
          displayName: participant.displayName ?? participant.handle,
        })),
      }),
    );

    const savedMessagesResult =
      await this.saveMessagesAndEnqueueContactCreationService.saveMessagesAndEnqueueContactCreation(
        messagesToSave,
        messageChannel,
        messageChannel.connectedAccount,
        workspaceId,
      );

    return input.messages.flatMap((message) => {
      const messageId = savedMessagesResult?.messageExternalIdsAndIdsMap.get(
        message.externalId,
      );
      const messageThreadId =
        savedMessagesResult?.messageExternalIdToMessageThreadIdMap.get(
          message.externalId,
        );

      if (!isDefined(messageId) || !isDefined(messageThreadId)) {
        return [];
      }

      return [
        {
          externalId: message.externalId,
          messageId,
          messageThreadId,
        },
      ];
    });
  }
}
