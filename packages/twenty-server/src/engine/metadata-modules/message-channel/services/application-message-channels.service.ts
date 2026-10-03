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
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { MESSAGE_THREAD_CHANNEL_RECORD_SHARE_SOURCE } from 'src/modules/connected-account/channel-record-share/constants/message-thread-channel-record-share-source.constant';
import { ChannelRecordShareService } from 'src/modules/connected-account/channel-record-share/services/channel-record-share.service';

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
};

type UpdateArgs = ApplicationScope & {
  id: string;
  displayName?: string | null;
  visibility?: MessageChannelVisibility;
  isSyncEnabled?: boolean;
};

// TypeORM's update() cannot take the relations Partial<MessageChannelEntity> carries
type UpdatableChannelFields = Partial<
  Pick<MessageChannelEntity, 'displayName' | 'visibility' | 'isSyncEnabled'>
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
    private readonly channelRecordShareService: ChannelRecordShareService,
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
    handle,
    displayName,
    visibility,
  }: CreateArgs): Promise<MessageChannelDTO> {
    await this.assertOwnsConnectedAccount({
      applicationId,
      workspaceId,
      requestUserWorkspaceId,
      connectedAccountId,
    });

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

  async update({
    applicationId,
    workspaceId,
    requestUserWorkspaceId,
    id,
    displayName,
    visibility,
    isSyncEnabled,
  }: UpdateArgs): Promise<MessageChannelDTO> {
    const { messageChannel } = await this.findOwnedOrThrow({
      applicationId,
      workspaceId,
      requestUserWorkspaceId,
      id,
    });

    const data: Omit<UpdatableChannelFields, 'visibility'> = {};

    if (displayName !== undefined) {
      data.displayName = normalizeDisplayName(displayName);
    }

    if (isDefined(isSyncEnabled)) {
      data.isSyncEnabled = isSyncEnabled;
    }

    if (!isDefined(visibility) && Object.keys(data).length === 0) {
      return messageChannel;
    }

    // Written first so that a failed grant sync leaves the channel untouched
    if (isDefined(visibility)) {
      await this.channelRecordShareService.changeChannelVisibility({
        workspaceId,
        source: MESSAGE_THREAD_CHANNEL_RECORD_SHARE_SOURCE,
        channelId: id,
        visibility,
      });
    }

    if (Object.keys(data).length > 0) {
      await this.messageChannelRepository.update({ id, workspaceId }, data);
    }

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
  private async assertOwnsConnectedAccount(
    args: ApplicationScope & { connectedAccountId: string },
  ): Promise<void> {
    if (!isDefined(await this.findReachableConnectedAccount(args))) {
      throw this.ownershipViolation(args.connectedAccountId);
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
      select: { id: true, visibility: true, userWorkspaceId: true },
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
