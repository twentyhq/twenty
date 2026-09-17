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

type ApplicationScope = {
  applicationId: string;
  workspaceId: string;
  // The user behind the call, when there is one. An APPLICATION_ACCESS token
  // carries them whenever a person triggered the run, and owning the app is
  // not the same as being allowed to administer another person's private
  // connection — so the channel API has to honour the same boundary the
  // connection API does. Null for cron, webhooks and install hooks, which act
  // as the application itself.
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

// The scalar subset an app may change. Narrower than Partial<MessageChannelEntity>,
// which carries the relations TypeORM's update() cannot take.
type UpdatableChannelFields = Partial<
  Pick<MessageChannelEntity, 'displayName' | 'visibility' | 'isSyncEnabled'>
>;

export type OwnedMessageChannel = {
  messageChannel: MessageChannelEntity;
  connectedAccount: ConnectedAccountEntity;
};

// A name that is only whitespace is no name: stored as null so the UI falls
// back to the handle, rather than rendering a blank row.
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
      // Inert for an app channel: it is excluded from the polling crons, which
      // are the only writers of these fields. Mirrors EMAIL_GROUP, the other
      // push-delivered channel, so the sync-status UI reads it as healthy.
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

  // Resolving the channel through the app's own connections is what stops one
  // app from reading or mutating another app's channels: the connected account
  // carries the applicationId, the channel does not. Public because ingestion
  // gates on the same check, and there must be exactly one of it.
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

    // Missing and not-reachable answer identically, and neither names the
    // connection. Letting the two differ would tell a caller holding a channel
    // id that the channel exists and whose connection backs it — the same
    // probe ownershipViolation() exists to prevent one step earlier.
    if (!isDefined(messageChannel) || !isDefined(connectedAccount)) {
      throw new MessageChannelException(
        `Message channel ${id} not found`,
        MessageChannelExceptionCode.MESSAGE_CHANNEL_NOT_FOUND,
      );
    }

    // The account comes back with the channel because the gate has already
    // loaded it: ingestion needs the same row, and re-reading it would be a
    // second round trip for a value we are holding.
    return { messageChannel, connectedAccount };
  }

  // Two boundaries, not one: the connection must belong to this application,
  // AND the caller must be allowed to see it. Checking only the first would
  // let any user of an app administer another user's private connection —
  // including flipping its channel to SHARE_EVERYTHING, which publishes that
  // person's messages to the whole workspace.
  private async assertOwnsConnectedAccount(
    args: ApplicationScope & { connectedAccountId: string },
  ): Promise<void> {
    if (!isDefined(await this.findReachableConnectedAccount(args))) {
      throw this.ownershipViolation(args.connectedAccountId);
    }
  }

  // Public because the shared MessageChannelResolver resolves an app channel's
  // connectedAccount field through it: the app-facing reachability rule —
  // owned by this application, and not another member's private connection —
  // must have exactly one implementation.
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

  // Deliberately indistinguishable from "not found": whether a connection id
  // exists is not something one app should be able to probe for another.
  private ownershipViolation(connectedAccountId: string) {
    return new MessageChannelException(
      `Connection ${connectedAccountId} not found`,
      MessageChannelExceptionCode.MESSAGE_CHANNEL_OWNERSHIP_VIOLATION,
    );
  }
}
