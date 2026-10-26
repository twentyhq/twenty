import { Injectable } from '@nestjs/common';

import {
  FieldActorSource,
  MessageChannelContactAutoCreationPolicy,
  MessageChannelType,
  MessageParticipantRole,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Any, IsNull } from 'typeorm';

import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  CreateCompanyAndContactJob,
  type CreateCompanyAndContactJobData,
} from 'src/modules/contact-creation-manager/jobs/create-company-and-contact.job';
import {
  type Participant,
  type ParticipantWithMessageId,
} from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message.type';
import { MessagingMessageFolderAssociationService } from 'src/modules/messaging/message-import-manager/services/messaging-message-folder-association.service';
import { MessagingMessageService } from 'src/modules/messaging/message-import-manager/services/messaging-message.service';
import { type MessageChannelMessageAssociationFolderAssociation } from 'src/modules/messaging/message-import-manager/types/message-channel-message-association-folder-association.type';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message.type';
import { isGroupEmail } from 'src/modules/messaging/message-import-manager/utils/is-group-email';
import { MessagingMessageParticipantService } from 'src/modules/messaging/message-participant-manager/services/messaging-message-participant.service';
import { type PersonHandleField } from 'src/modules/match-participant/person-handle-field/types/person-handle-field.type';
import { isWorkEmail } from 'src/utils/is-work-email';

@Injectable()
export class MessagingSaveMessagesAndEnqueueContactCreationService {
  constructor(
    @InjectMessageQueue(MessageQueue.contactCreationQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly messageService: MessagingMessageService,
    private readonly messageParticipantService: MessagingMessageParticipantService,
    private readonly messageFolderAssociationService: MessagingMessageFolderAssociationService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async saveMessagesAndEnqueueContactCreation({
    messagesToSave,
    messageChannel,
    connectedAccount,
    workspaceId,
    personHandleField,
  }: {
    messagesToSave: MessageWithParticipants[];
    messageChannel: MessageChannelEntity;
    connectedAccount: ConnectedAccountEntity;
    workspaceId: string;
    personHandleField?: PersonHandleField;
  }): Promise<
    | {
        messageExternalIdsAndIdsMap: Map<string, string>;
        messageExternalIdToMessageThreadIdMap: Map<string, string>;
      }
    | undefined
  > {
    const handleAliases = connectedAccount.handleAliases || [];
    const authContext = buildSystemAuthContext(workspaceId);

    const savedMessagesResult =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        async () => {
          return this.workspaceOrmManager.runInWorkspaceTransaction(
            async (transactionScope) => {
              const {
                messageExternalIdsAndIdsMap,
                messageExternalIdToMessageChannelMessageAssociationIdMap,
                messageExternalIdToMessageThreadIdMap,
              } = await this.messageService.saveMessagesWithinTransaction(
                messagesToSave,
                messageChannel.id,
                transactionScope,
                workspaceId,
              );

              const participantsWithMessageId: (ParticipantWithMessageId & {
                shouldCreateContact: boolean;
              })[] = messagesToSave.flatMap((message) => {
                const messageId = messageExternalIdsAndIdsMap.get(
                  message.externalId,
                );

                return messageId
                  ? message.participants.map((participant: Participant) => {
                      const fromHandle =
                        message.participants.find(
                          (p) => p.role === MessageParticipantRole.FROM,
                        )?.handle || '';

                      const isMessageSentByConnectedAccount =
                        handleAliases.includes(fromHandle) ||
                        fromHandle === connectedAccount.handle;

                      const isParticipantConnectedAccount =
                        handleAliases.includes(participant.handle) ||
                        participant.handle === connectedAccount.handle;

                      const isExcludedByNonProfessionalEmails =
                        messageChannel.excludeNonProfessionalEmails &&
                        !isWorkEmail(participant.handle);

                      const isExcludedByGroupEmails =
                        messageChannel.excludeGroupEmails &&
                        isGroupEmail(participant.handle);

                      // Drafts are outgoing, so recipients of an unsent email don't become contacts
                      const shouldCreateContact =
                        !message.isDraft &&
                        !!participant.handle &&
                        !isParticipantConnectedAccount &&
                        !isExcludedByNonProfessionalEmails &&
                        !isExcludedByGroupEmails &&
                        (messageChannel.contactAutoCreationPolicy ===
                          MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED ||
                          (messageChannel.contactAutoCreationPolicy ===
                            MessageChannelContactAutoCreationPolicy.SENT &&
                            isMessageSentByConnectedAccount));

                      return {
                        ...participant,
                        messageId,
                        shouldCreateContact,
                      };
                    })
                  : [];
              });

              const savedMessageParticipants =
                await this.messageParticipantService.saveMessageParticipants(
                  participantsWithMessageId,
                  workspaceId,
                  transactionScope,
                );

              const folderAssociations: MessageChannelMessageAssociationFolderAssociation[] =
                messagesToSave.flatMap((message) => {
                  const messageFolderIds = message.messageFolderIds ?? [];

                  if (messageFolderIds.length === 0) {
                    return [];
                  }

                  const associationId =
                    messageExternalIdToMessageChannelMessageAssociationIdMap.get(
                      message.externalId,
                    );

                  if (!isDefined(associationId)) {
                    return [];
                  }

                  return [
                    {
                      messageChannelMessageAssociationId: associationId,
                      messageFolderIds,
                    },
                  ];
                });

              await this.messageFolderAssociationService.saveMessageFolderAssociations(
                folderAssociations,
                workspaceId,
                transactionScope,
              );

              return {
                participantsWithMessageId,
                savedMessageParticipants,
                messageExternalIdsAndIdsMap,
                messageExternalIdToMessageThreadIdMap,
              };
            },
          );
        },
        authContext,
        { lite: true },
      );

    if (messageChannel.isContactAutoCreationEnabled && savedMessagesResult) {
      const contactsToCreate =
        savedMessagesResult.participantsWithMessageId.filter(
          (participant) => participant.shouldCreateContact,
        );

      await this.messageQueueService.add<CreateCompanyAndContactJobData>(
        CreateCompanyAndContactJob.name,
        {
          workspaceId,
          connectedAccount,
          contactsToCreate,
          source: FieldActorSource.EMAIL,
        },
      );
    }

    if (!isDefined(savedMessagesResult)) {
      return undefined;
    }

    const messageIds = [
      ...new Set(
        savedMessagesResult.participantsWithMessageId.map(
          ({ messageId }) => messageId,
        ),
      ),
    ];

    if (messageChannel.type !== MessageChannelType.APP) {
      await this.messageParticipantService.matchMessageParticipants({
        participants: savedMessagesResult.savedMessageParticipants,
        messageIds,
        workspaceId,
        matchWith: 'workspaceMemberAndPerson',
      });
    } else {
      await this.matchAppChannelParticipants({
        personHandleField,
        messageIds,
        workspaceId,
      });
    }

    return {
      messageExternalIdsAndIdsMap:
        savedMessagesResult.messageExternalIdsAndIdsMap,
      messageExternalIdToMessageThreadIdMap:
        savedMessagesResult.messageExternalIdToMessageThreadIdMap,
    };
  }

  // matching non-email handles as emails would null out app-supplied identities, so only the declared field is used
  private async matchAppChannelParticipants({
    personHandleField,
    messageIds,
    workspaceId,
  }: {
    personHandleField: PersonHandleField | undefined;
    messageIds: string[];
    workspaceId: string;
  }): Promise<void> {
    if (!isDefined(personHandleField)) {
      await this.messageParticipantService.matchMessageParticipants({
        participants: [],
        messageIds,
        workspaceId,
        matchWith: 'targetsOnly',
      });

      return;
    }

    await this.messageParticipantService.matchMessageParticipants({
      participants: await this.findUnlinkedParticipants({
        messageIds,
        workspaceId,
      }),
      messageIds,
      workspaceId,
      matchWith: 'personOnly',
      personHandleField,
    });
  }

  // read back rather than taken from the save, so a retry after a failed match still links rows an earlier attempt stored
  private async findUnlinkedParticipants({
    messageIds,
    workspaceId,
  }: {
    messageIds: string[];
    workspaceId: string;
  }): Promise<MessageParticipantWorkspaceEntity[]> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      async () =>
        this.workspaceOrmManager
          .getRepository<MessageParticipantWorkspaceEntity>(
            'messageParticipant',
            { shouldBypassPermissionChecks: true },
          )
          .find({ where: { messageId: Any(messageIds), personId: IsNull() } }),
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }
}
