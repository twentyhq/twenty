import { Injectable } from '@nestjs/common';

import { MessageChannelService } from 'src/workspace/messaging/repositories/message-channel/message-channel.service';
import { MessageParticipantService } from 'src/workspace/messaging/repositories/message-participant/message-participant.service';
import { MessageService } from 'src/workspace/messaging/repositories/message/message.service';
import { CreateCompaniesAndContactsService } from 'src/workspace/messaging/services/create-companies-and-contacts/create-companies-and-contacts.service';
import {
  GmailMessage,
  ParticipantWithMessageId,
} from 'src/workspace/messaging/types/gmail-message';
import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { ConnectedAccountObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/connected-account.object-metadata';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';

@Injectable()
export class SaveMessagesAndCreateContactsService {
  constructor(
    private readonly messageService: MessageService,
    private readonly messageChannelService: MessageChannelService,
    private readonly createCompaniesAndContactsService: CreateCompaniesAndContactsService,
    private readonly messageParticipantService: MessageParticipantService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async saveMessagesAndCreateContacts(
    messagesToSave: GmailMessage[],
    connectedAccount: ObjectRecord<ConnectedAccountObjectMetadata>,
    workspaceId: string,
    gmailMessageChannelId: string,
  ) {
    const { dataSource: workspaceDataSource, dataSourceMetadata } =
      await this.workspaceDataSourceService.connectedToWorkspaceDataSourceAndReturnMetadata(
        workspaceId,
      );

    console.time('saving messages');

    const messageExternalIdsAndIdsMap = await this.messageService.saveMessages(
      messagesToSave,
      dataSourceMetadata,
      workspaceDataSource,
      connectedAccount,
      gmailMessageChannelId,
      workspaceId,
    );

    console.timeEnd('saving messages');

    const isContactAutoCreationEnabled =
      await this.messageChannelService.getIsContactAutoCreationEnabledByConnectedAccountIdOrFail(
        connectedAccount.id,
        workspaceId,
      );

    const participantsWithMessageId: ParticipantWithMessageId[] =
      messagesToSave.flatMap((message) => {
        const messageId = messageExternalIdsAndIdsMap.get(message.externalId);

        return messageId
          ? message.participants.map((participant) => ({
              ...participant,
              messageId,
            }))
          : [];
      });

    const contactsToCreate = messagesToSave
      .filter((message) => connectedAccount.handle === message.fromHandle)
      .flatMap((message) => message.participants);

    if (isContactAutoCreationEnabled) {
      console.time('creating companies and contacts');
      await this.createCompaniesAndContactsService.createCompaniesAndContacts(
        connectedAccount.handle,
        contactsToCreate,
        workspaceId,
      );

      const handles = participantsWithMessageId.map(
        (participant) => participant.handle,
      );

      const messageParticipantsWithoutPersonIdAndWorkspaceMemberId =
        await this.messageParticipantService.getByHandlesWithoutPersonIdAndWorkspaceMemberId(
          handles,
          workspaceId,
        );

      await this.messageParticipantService.updateMessageParticipantsAfterPeopleCreation(
        messageParticipantsWithoutPersonIdAndWorkspaceMemberId,
        workspaceId,
      );
      console.timeEnd('creating companies and contacts');
    }

    console.time('saving message participants');

    await this.messageParticipantService.saveMessageParticipants(
      participantsWithMessageId,
      workspaceId,
    );

    console.timeEnd('saving message participants');
  }
}
