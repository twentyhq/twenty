import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import {
  ConnectedAccountProvider,
  MessageChannelContactAutoCreationPolicy,
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  type MessageChannelVisibility,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { MESSAGE_CHANNEL_DELETED_EVENT } from 'src/engine/metadata-modules/message-channel/constants/message-channel-deleted.constant';
import { isConnectionHiddenFromRequestUser } from 'src/engine/core-modules/application/connection-provider/connections/utils/is-connection-hidden-from-request-user.util';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type MessageChannelDTO } from 'src/engine/metadata-modules/message-channel/dtos/message-channel.dto';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { type MessageChannelDeletedEvent } from 'src/engine/metadata-modules/message-channel/types/message-channel-deleted.type';
import { findMessagingProviderOnConnectionProvider } from 'src/engine/metadata-modules/messaging-provider/utils/find-messaging-provider-on-connection-provider.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { PersonHandleFieldService } from 'src/modules/match-participant/person-handle-field/person-handle-field.service';
import { canonicalizePersonHandle } from 'src/modules/match-participant/person-handle-field/utils/canonicalize-person-handle.util';

type ApplicationScope = {
  applicationId: string;
  workspaceId: string;
  // the person who triggered the run, since owning the app does not grant access to another member's private connection;
  // null for cron, webhooks and install hooks
  requestUserWorkspaceId: string | null;
};

type CreateArgs = ApplicationScope & {
  connectedAccountId: string;
  handle: string;
  displayName?: string;
  visibility: MessageChannelVisibility;
  participantHandleFieldUniversalIdentifier?: string;
  messagingProviderUniversalIdentifier?: string;
};

type UpdateArgs = ApplicationScope & {
  id: string;
  displayName?: string | null;
  visibility?: MessageChannelVisibility;
  isSyncEnabled?: boolean;
  messagingProviderUniversalIdentifier?: string | null;
};

// TypeORM's update() cannot take the relations Partial<MessageChannelEntity> carries
type UpdatableChannelFields = Partial<
  Pick<
    MessageChannelEntity,
    | 'displayName'
    | 'visibility'
    | 'isSyncEnabled'
    | 'messagingProviderUniversalIdentifier'
  >
>;

export type OwnedMessageChannel = {
  messageChannel: MessageChannelEntity;
  connectedAccount: ConnectedAccountEntity;
};

// null rather than blank so the UI falls back to the handle
const normalizeDisplayName = (displayName?: string | null): string | null => {
  const trimmedDisplayName = displayName?.trim();

  return isNonEmptyString(trimmedDisplayName) ? trimmedDisplayName : null;
};

@Injectable()
export class ApplicationMessageChannelsService {
  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly personHandleFieldService: PersonHandleFieldService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async list({
    applicationId,
    workspaceId,
    requestUserWorkspaceId,
    connectedAccountId,
  }: ApplicationScope & {
    connectedAccountId?: string;
  }): Promise<MessageChannelDTO[]> {
    const ownedAccountIds = await this.findReachableConnectedAccountIds({
      applicationId,
      workspaceId,
      requestUserWorkspaceId,
    });

    if (ownedAccountIds.length === 0) {
      return [];
    }

    if (
      isDefined(connectedAccountId) &&
      !ownedAccountIds.includes(connectedAccountId)
    ) {
      throw this.ownershipViolation(connectedAccountId);
    }

    return this.messageChannelRepository.find({
      where: {
        connectedAccountId: isDefined(connectedAccountId)
          ? connectedAccountId
          : In(ownedAccountIds),
        workspaceId,
        type: MessageChannelType.APP,
      },
    });
  }

  async create({
    applicationId,
    workspaceId,
    requestUserWorkspaceId,
    connectedAccountId,
    handle: requestedHandle,
    displayName,
    visibility,
    participantHandleFieldUniversalIdentifier,
    messagingProviderUniversalIdentifier,
  }: CreateArgs): Promise<MessageChannelDTO> {
    const connectedAccount = await this.findOwnedConnectedAccountOrThrow({
      applicationId,
      workspaceId,
      requestUserWorkspaceId,
      connectedAccountId,
    });

    const handle = await this.resolveChannelHandleOrThrow({
      workspaceId,
      handle: requestedHandle,
      participantHandleFieldUniversalIdentifier,
    });

    if (isDefined(messagingProviderUniversalIdentifier)) {
      await this.assertMessagingProviderFitsConnectionOrThrow({
        applicationId,
        workspaceId,
        connectedAccount,
        messagingProviderUniversalIdentifier,
      });
    }

    const existingChannel = await this.messageChannelRepository.findOne({
      where: { connectedAccountId, handle, workspaceId },
    });

    if (isDefined(existingChannel)) {
      throw new MessageChannelException(
        `A message channel already exists for handle ${handle} on connection ${connectedAccountId}`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    const entity = this.messageChannelRepository.create({
      workspaceId,
      connectedAccountId,
      handle,
      displayName: normalizeDisplayName(displayName),
      type: MessageChannelType.APP,
      visibility,
      participantHandleFieldUniversalIdentifier:
        participantHandleFieldUniversalIdentifier ?? null,
      messagingProviderUniversalIdentifier:
        messagingProviderUniversalIdentifier ?? null,
      isSyncEnabled: true,
      // inert since app channels skip the polling crons; mirrors EMAIL_GROUP so the UI reads healthy
      syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      syncStatus: MessageChannelSyncStatus.ACTIVE,
      isContactAutoCreationEnabled: false,
      contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy.SENT,
      excludeGroupEmails: false,
      excludeNonProfessionalEmails: false,
      pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction.NONE,
    });

    return this.messageChannelRepository.save(entity);
  }

  // the channel's own handle shares its participants' namespace, so direction still compares like with like
  private async resolveChannelHandleOrThrow({
    workspaceId,
    handle,
    participantHandleFieldUniversalIdentifier,
  }: Pick<
    CreateArgs,
    'workspaceId' | 'handle' | 'participantHandleFieldUniversalIdentifier'
  >): Promise<string> {
    if (!isDefined(participantHandleFieldUniversalIdentifier)) {
      return handle;
    }

    const personHandleField =
      await this.personHandleFieldService.findByUniversalIdentifier({
        workspaceId,
        fieldUniversalIdentifier: participantHandleFieldUniversalIdentifier,
      });

    if (!isDefined(personHandleField)) {
      throw new MessageChannelException(
        `Field ${participantHandleFieldUniversalIdentifier} is not an active person field of type EMAILS, PHONES, LINKS or TEXT`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    const canonicalHandle = canonicalizePersonHandle({
      type: personHandleField.type,
      value: handle,
    });

    if (!isDefined(canonicalHandle)) {
      throw new MessageChannelException(
        `Handle ${handle} is not a valid ${personHandleField.type} value`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    return canonicalHandle;
  }

  async update({
    applicationId,
    workspaceId,
    requestUserWorkspaceId,
    id,
    displayName,
    visibility,
    isSyncEnabled,
    messagingProviderUniversalIdentifier,
  }: UpdateArgs): Promise<MessageChannelDTO> {
    const { messageChannel, connectedAccount } = await this.findOwnedOrThrow({
      applicationId,
      workspaceId,
      requestUserWorkspaceId,
      id,
    });

    const data: UpdatableChannelFields = {};

    if (displayName !== undefined) {
      data.displayName = normalizeDisplayName(displayName);
    }

    if (isDefined(visibility)) {
      data.visibility = visibility;
    }

    if (isDefined(isSyncEnabled)) {
      data.isSyncEnabled = isSyncEnabled;
    }

    if (isDefined(messagingProviderUniversalIdentifier)) {
      await this.assertMessagingProviderFitsConnectionOrThrow({
        applicationId,
        workspaceId,
        connectedAccount,
        messagingProviderUniversalIdentifier,
      });
    }

    if (messagingProviderUniversalIdentifier !== undefined) {
      data.messagingProviderUniversalIdentifier =
        messagingProviderUniversalIdentifier;
    }

    if (Object.keys(data).length === 0) {
      return messageChannel;
    }

    await this.messageChannelRepository.update({ id, workspaceId }, data);

    return this.messageChannelRepository.findOneOrFail({
      where: { id, workspaceId },
    });
  }

  async delete({
    applicationId,
    workspaceId,
    requestUserWorkspaceId,
    id,
  }: ApplicationScope & { id: string }): Promise<MessageChannelDTO> {
    const { messageChannel } = await this.findOwnedOrThrow({
      applicationId,
      workspaceId,
      requestUserWorkspaceId,
      id,
    });

    await this.messageChannelRepository.delete({ id, workspaceId });

    this.workspaceEventEmitter.emitCustomBatchEvent<MessageChannelDeletedEvent>(
      MESSAGE_CHANNEL_DELETED_EVENT,
      [{ messageChannelId: id }],
      workspaceId,
    );

    return messageChannel;
  }

  // only the connected account carries applicationId, so resolving through it is what isolates apps
  async findOwnedOrThrow({
    applicationId,
    workspaceId,
    requestUserWorkspaceId,
    id,
  }: ApplicationScope & { id: string }): Promise<OwnedMessageChannel> {
    const messageChannel = await this.messageChannelRepository.findOne({
      where: { id, workspaceId, type: MessageChannelType.APP },
    });

    const connectedAccount = isDefined(messageChannel)
      ? await this.findReachableConnectedAccount({
          applicationId,
          workspaceId,
          requestUserWorkspaceId,
          connectedAccountId: messageChannel.connectedAccountId,
        })
      : null;

    // missing and unreachable answer identically so callers cannot probe for channels
    if (!isDefined(messageChannel) || !isDefined(connectedAccount)) {
      throw new MessageChannelException(
        `Message channel ${id} not found`,
        MessageChannelExceptionCode.MESSAGE_CHANNEL_NOT_FOUND,
      );
    }

    return { messageChannel, connectedAccount };
  }

  // ownership alone would let any app user flip another member's private channel to SHARE_EVERYTHING
  private async findOwnedConnectedAccountOrThrow(
    args: ApplicationScope & { connectedAccountId: string },
  ): Promise<ConnectedAccountEntity> {
    const connectedAccount = await this.findReachableConnectedAccount(args);

    if (!isDefined(connectedAccount)) {
      throw this.ownershipViolation(args.connectedAccountId);
    }

    return connectedAccount;
  }

  private async assertMessagingProviderFitsConnectionOrThrow({
    applicationId,
    workspaceId,
    connectedAccount,
    messagingProviderUniversalIdentifier,
  }: Pick<ApplicationScope, 'applicationId' | 'workspaceId'> & {
    connectedAccount: Pick<ConnectedAccountEntity, 'connectionProviderId'>;
    messagingProviderUniversalIdentifier: string;
  }): Promise<void> {
    const { flatMessagingProviderMaps, flatConnectionProviderMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatMessagingProviderMaps',
        'flatConnectionProviderMaps',
      ]);

    const messagingProvider = findMessagingProviderOnConnectionProvider({
      flatMessagingProviderMaps,
      flatConnectionProviderMaps,
      messagingProviderUniversalIdentifier,
      connectionProviderId: connectedAccount.connectionProviderId,
    });

    if (
      !isDefined(messagingProvider) ||
      messagingProvider.applicationId !== applicationId
    ) {
      throw new MessageChannelException(
        `Messaging provider ${messagingProviderUniversalIdentifier} is not one of this application's providers on this connection's provider`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }
  }

  // public so MessageChannelResolver shares the single reachability rule
  async findReachableConnectedAccount({
    applicationId,
    workspaceId,
    requestUserWorkspaceId,
    connectedAccountId,
  }: ApplicationScope & {
    connectedAccountId: string;
  }): Promise<ConnectedAccountEntity | null> {
    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: {
        id: connectedAccountId,
        applicationId,
        workspaceId,
        provider: ConnectedAccountProvider.APP,
      },
    });

    if (
      !isDefined(connectedAccount) ||
      isConnectionHiddenFromRequestUser({
        account: connectedAccount,
        requestUserWorkspaceId,
      })
    ) {
      return null;
    }

    return connectedAccount;
  }

  private async findReachableConnectedAccountIds({
    applicationId,
    workspaceId,
    requestUserWorkspaceId,
  }: ApplicationScope): Promise<string[]> {
    const connectedAccounts = await this.connectedAccountRepository.find({
      where: {
        applicationId,
        workspaceId,
        provider: ConnectedAccountProvider.APP,
      },
      select: { id: true, scope: true, userWorkspaceId: true },
    });

    return connectedAccounts
      .filter(
        (connectedAccount) =>
          !isConnectionHiddenFromRequestUser({
            account: connectedAccount,
            requestUserWorkspaceId,
          }),
      )
      .map((connectedAccount) => connectedAccount.id);
  }

  // indistinguishable from not found so one app cannot probe another's connection ids
  private ownershipViolation(connectedAccountId: string) {
    return new MessageChannelException(
      `Connection ${connectedAccountId} not found`,
      MessageChannelExceptionCode.MESSAGE_CHANNEL_OWNERSHIP_VIOLATION,
    );
  }
}
