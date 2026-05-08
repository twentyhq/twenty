import { randomBytes } from 'crypto';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { In, Repository } from 'typeorm';

import {
  ConnectedAccountProvider,
  MessageChannelContactAutoCreationPolicy,
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  MessageChannelVisibility,
} from 'twenty-shared/types';

import { StorageDriverType } from 'src/engine/core-modules/file-storage/interfaces/file-storage.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { CreateEmailGroupChannelOutput } from 'src/engine/metadata-modules/message-channel/dtos/create-email-group-channel.output';
import { MessageChannelDTO } from 'src/engine/metadata-modules/message-channel/dtos/message-channel.dto';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { INBOUND_EMAIL_LOCAL_PART_PREFIX } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/constants/inbound-email-local-part-prefix.constant';
import { INBOUND_EMAIL_LOCAL_PART_RANDOM_BYTES } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/constants/inbound-email-local-part-random-bytes.constant';

@Injectable()
export class MessageChannelMetadataService {
  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly repository: Repository<MessageChannelEntity>,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async findAll(workspaceId: string): Promise<MessageChannelDTO[]> {
    return this.repository.find({ where: { workspaceId } });
  }

  async findByUserWorkspaceId({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<MessageChannelDTO[]> {
    const userAccountIds =
      await this.connectedAccountMetadataService.getUserConnectedAccountIds({
        userWorkspaceId,
        workspaceId,
      });

    return this.findByConnectedAccountIds({
      connectedAccountIds: userAccountIds,
      workspaceId,
    });
  }

  async findByConnectedAccountIdForUser({
    connectedAccountId,
    userWorkspaceId,
    workspaceId,
  }: {
    connectedAccountId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<MessageChannelDTO[]> {
    await this.connectedAccountMetadataService.verifyOwnership({
      id: connectedAccountId,
      userWorkspaceId,
      workspaceId,
    });

    return this.findByConnectedAccountId({ connectedAccountId, workspaceId });
  }

  async findByConnectedAccountId({
    connectedAccountId,
    workspaceId,
  }: {
    connectedAccountId: string;
    workspaceId: string;
  }): Promise<MessageChannelDTO[]> {
    return this.repository.find({
      where: { connectedAccountId, workspaceId },
    });
  }

  async findByConnectedAccountIds({
    connectedAccountIds,
    workspaceId,
  }: {
    connectedAccountIds: string[];
    workspaceId: string;
  }): Promise<MessageChannelDTO[]> {
    if (connectedAccountIds.length === 0) {
      return [];
    }

    return this.repository.find({
      where: { connectedAccountId: In(connectedAccountIds), workspaceId },
    });
  }

  async findById({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<MessageChannelDTO | null> {
    return this.repository.findOne({ where: { id, workspaceId } });
  }

  async verifyOwnership({
    id,
    userWorkspaceId,
    workspaceId,
  }: {
    id: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<MessageChannelEntity> {
    const messageChannel = await this.repository.findOne({
      where: { id, workspaceId },
    });

    if (!messageChannel) {
      throw new MessageChannelException(
        `Message channel ${id} not found`,
        MessageChannelExceptionCode.MESSAGE_CHANNEL_NOT_FOUND,
      );
    }

    const userAccountIds =
      await this.connectedAccountMetadataService.getUserConnectedAccountIds({
        userWorkspaceId,
        workspaceId,
      });

    if (!userAccountIds.includes(messageChannel.connectedAccountId)) {
      throw new MessageChannelException(
        `Message channel ${id} does not belong to user workspace ${userWorkspaceId}`,
        MessageChannelExceptionCode.MESSAGE_CHANNEL_OWNERSHIP_VIOLATION,
      );
    }

    return messageChannel;
  }

  async create(
    data: Partial<MessageChannelEntity> & {
      workspaceId: string;
      handle: string;
      connectedAccountId: string;
      visibility: MessageChannelVisibility;
      type: MessageChannelType;
      syncStage: MessageChannelSyncStage;
    },
  ): Promise<MessageChannelDTO> {
    const entity = this.repository.create(data);

    return this.repository.save(entity);
  }

  async update({
    id,
    workspaceId,
    data,
  }: {
    id: string;
    workspaceId: string;
    data: Partial<MessageChannelEntity>;
  }): Promise<MessageChannelDTO> {
    await this.repository.update(
      { id, workspaceId },
      data as Record<string, unknown>,
    );

    return this.repository.findOneOrFail({ where: { id, workspaceId } });
  }

  async createEmailGroupChannel({
    handle,
    userWorkspaceId,
    workspaceId,
  }: {
    handle: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<CreateEmailGroupChannelOutput> {
    const inboundEmailDomain = this.twentyConfigService.get(
      'INBOUND_EMAIL_DOMAIN',
    );
    const storageType = this.twentyConfigService.get('STORAGE_TYPE');

    if (
      !isNonEmptyString(inboundEmailDomain) ||
      storageType !== StorageDriverType.S_3
    ) {
      throw new MessageChannelException(
        'Email group is not configured: INBOUND_EMAIL_DOMAIN must be set and STORAGE_TYPE must be S3',
        MessageChannelExceptionCode.EMAIL_GROUP_NOT_CONFIGURED,
      );
    }

    const localPart =
      INBOUND_EMAIL_LOCAL_PART_PREFIX +
      randomBytes(INBOUND_EMAIL_LOCAL_PART_RANDOM_BYTES).toString('hex');

    const forwardingAddress = `${localPart}@${inboundEmailDomain}`;

    const connectedAccount = await this.connectedAccountMetadataService.create({
      workspaceId,
      handle,
      provider: ConnectedAccountProvider.EMAIL_GROUP,
      userWorkspaceId,
      accessToken: null,
      refreshToken: null,
    });

    const messageChannel = await this.create({
      workspaceId,
      handle: forwardingAddress,
      connectedAccountId: connectedAccount.id,
      type: MessageChannelType.EMAIL_GROUP,
      visibility: MessageChannelVisibility.SHARE_EVERYTHING,
      syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      syncStatus: MessageChannelSyncStatus.ACTIVE,
      isSyncEnabled: true,
      isContactAutoCreationEnabled: true,
      contactAutoCreationPolicy:
        MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED,
      excludeGroupEmails: false,
      excludeNonProfessionalEmails: false,
      pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction.NONE,
    });

    return { messageChannel, forwardingAddress };
  }

  async delete({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<MessageChannelDTO> {
    const messageChannel = await this.repository.findOneOrFail({
      where: { id, workspaceId },
    });

    await this.repository.delete({ id, workspaceId });

    return messageChannel;
  }
}
