import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { EntityManager } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import {
  ParticipantWithId,
  ParticipantWithMessageId,
} from 'src/modules/messaging/types/gmail-message';
import { PersonRepository } from 'src/modules/person/repositories/person.repository';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { MessageParticipantRepository } from 'src/modules/messaging/repositories/message-participant.repository';
import { MessageService } from 'src/modules/messaging/services/message/message.service';

@Injectable()
export class MessageParticipantService {
  private readonly logger = new Logger(MessageParticipantService.name);

  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @InjectObjectMetadataRepository(PersonObjectMetadata)
    private readonly personRepository: PersonRepository,
    private readonly messageParticipantRepository: MessageParticipantRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly messageService: MessageService,
  ) {}

  public async updateMessageParticipantsAfterPeopleCreation(
    participants: ParticipantWithId[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    if (!participants) return;

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const handles = participants.map((participant) => participant.handle);

    const participantPersonIds = await this.personRepository.getByEmails(
      handles,
      workspaceId,
      transactionManager,
    );

    const messageParticipantsToUpdate = participants.map((participant) => [
      participant.id,
      participantPersonIds.find(
        (e: { id: string; email: string }) => e.email === participant.handle,
      )?.id,
    ]);

    if (messageParticipantsToUpdate.length === 0) return;

    const valuesString = messageParticipantsToUpdate
      .map((_, index) => `($${index * 2 + 1}::uuid, $${index * 2 + 2}::uuid)`)
      .join(', ');

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."messageParticipant" AS "messageParticipant" SET "personId" = "data"."personId"
      FROM (VALUES ${valuesString}) AS "data"("id", "personId")
      WHERE "messageParticipant"."id" = "data"."id"`,
      messageParticipantsToUpdate.flat(),
      workspaceId,
      transactionManager,
    );
  }

  public async tryToSaveMessageParticipantsOrDeleteMessagesIfError(
    participantsWithMessageId: ParticipantWithMessageId[],
    gmailMessageChannel: ObjectRecord<MessageChannelObjectMetadata>,
    workspaceId: string,
    connectedAccount: ObjectRecord<ConnectedAccountObjectMetadata>,
    jobName?: string,
  ) {
    try {
      await this.messageParticipantRepository.saveMessageParticipants(
        participantsWithMessageId,
        workspaceId,
      );

      if (gmailMessageChannel.isContactAutoCreationEnabled) {
        const contactsToCreate = participantsWithMessageId.filter(
          (participant) => participant.role === 'from',
        );

        this.eventEmitter.emit(`createContacts`, {
          workspaceId,
          connectedAccountHandle: connectedAccount.handle,
          contactsToCreate,
        });
      }
    } catch (error) {
      this.logger.error(
        `${jobName} error saving message participants for workspace ${workspaceId} and account ${connectedAccount.id}`,
        error,
      );

      const messagesToDelete = participantsWithMessageId.map(
        (participant) => participant.messageId,
      );

      await this.messageService.deleteMessages(
        messagesToDelete,
        gmailMessageChannel.id,
        workspaceId,
      );
    }
  }
}
