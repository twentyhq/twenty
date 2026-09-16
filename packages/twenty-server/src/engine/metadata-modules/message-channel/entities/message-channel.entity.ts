import { registerEnumType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import {
  MessageChannelContactAutoCreationPolicy,
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  MessageChannelVisibility,
  MessageFolderImportPolicy,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';

import { ADD_MESSAGE_CHANNEL_DEFAULT_INBOX_QUEUE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-42/add-message-channel-default-inbox-queue-upgrade-command-name.constant';
import { InboxQueueEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue.entity';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

registerEnumType(MessageChannelVisibility, {
  name: 'MessageChannelVisibility',
});
registerEnumType(MessageChannelSyncStatus, {
  name: 'MessageChannelSyncStatus',
});
registerEnumType(MessageChannelSyncStage, {
  name: 'MessageChannelSyncStage',
});
registerEnumType(MessageChannelType, { name: 'MessageChannelType' });
registerEnumType(MessageChannelContactAutoCreationPolicy, {
  name: 'MessageChannelContactAutoCreationPolicy',
});
registerEnumType(MessageFolderImportPolicy, {
  name: 'MessageFolderImportPolicy',
});
registerEnumType(MessageChannelPendingGroupEmailsAction, {
  name: 'MessageChannelPendingGroupEmailsAction',
});

@Entity({ name: 'messageChannel', schema: 'core' })
@Index('IDX_MESSAGE_CHANNEL_WORKSPACE_ID_SYNC_ENABLED_SYNC_STAGE', [
  'workspaceId',
  'isSyncEnabled',
  'syncStage',
])
@Index(
  'IDX_MESSAGE_CHANNEL_WEBHOOK_SUBSCRIPTION_EXTERNAL_ID',
  ['webhookSubscriptionExternalId'],
  { where: '"webhookSubscriptionExternalId" IS NOT NULL' },
)
// An app creates its channel from a connect hook, which a provider can retry
// or run concurrently. The create path reads before it writes, so only the
// database can actually stop a second row appearing for one handle. Scoped to
// APP so it makes no claim about the email rows already in this table.
@Index(
  'IDX_MESSAGE_CHANNEL_APP_CONNECTED_ACCOUNT_HANDLE_UNIQUE',
  ['workspaceId', 'connectedAccountId', 'handle'],
  { unique: true, where: `"type" = 'APP'` },
)
// Deleting a shared inbox detaches every channel pointing at it, which without
// this scans the whole table.
@Index('IDX_MESSAGE_CHANNEL_DEFAULT_INBOX_QUEUE_ID', ['defaultInboxQueueId'], {
  where: '"defaultInboxQueueId" IS NOT NULL',
})
export class MessageChannelEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MessageChannelVisibility,
    nullable: false,
  })
  visibility: MessageChannelVisibility;

  @Column({ type: 'varchar', nullable: false })
  handle: string;

  @Column({ type: 'varchar', nullable: true })
  displayName: string | null;

  @Column({
    type: 'enum',
    enum: MessageChannelType,
    nullable: false,
  })
  type: MessageChannelType;

  @Column({ type: 'boolean', nullable: false, default: true })
  isContactAutoCreationEnabled: boolean;

  @Column({
    type: 'enum',
    enum: MessageChannelContactAutoCreationPolicy,
    nullable: false,
    default: MessageChannelContactAutoCreationPolicy.SENT,
  })
  contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy;

  @Column({
    type: 'enum',
    enum: MessageFolderImportPolicy,
    nullable: false,
    default: MessageFolderImportPolicy.ALL_FOLDERS,
  })
  messageFolderImportPolicy: MessageFolderImportPolicy;

  @Column({ type: 'boolean', nullable: false, default: true })
  excludeNonProfessionalEmails: boolean;

  @Column({ type: 'boolean', nullable: false, default: true })
  excludeGroupEmails: boolean;

  @Column({
    type: 'enum',
    enum: MessageChannelPendingGroupEmailsAction,
    nullable: false,
  })
  pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction;

  @Column({ type: 'boolean', nullable: false, default: true })
  isSyncEnabled: boolean;

  @Column({ type: 'varchar', nullable: true })
  syncCursor: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  syncedAt: Date | null;

  @Column({
    type: 'enum',
    enum: MessageChannelSyncStatus,
    nullable: false,
    default: MessageChannelSyncStatus.NOT_SYNCED,
  })
  syncStatus: MessageChannelSyncStatus;

  @Column({
    type: 'enum',
    enum: MessageChannelSyncStage,
    nullable: false,
  })
  syncStage: MessageChannelSyncStage;

  @Column({ type: 'timestamptz', nullable: true })
  syncStageStartedAt: Date | null;

  @Column({ type: 'integer', nullable: false, default: 0 })
  throttleFailureCount: number;

  @Column({ type: 'timestamptz', nullable: true })
  throttleRetryAfter: Date | null;

  @Column({ type: 'varchar', nullable: true })
  webhookSubscriptionExternalId: string | null;

  @Column({ type: 'varchar', nullable: true })
  webhookSubscriptionClientState: string | null;

  @Column({
    type: 'enum',
    enum: WebhookSubscriptionStatus,
    nullable: true,
  })
  webhookSubscriptionStatus: WebhookSubscriptionStatus | null;

  @Column({ type: 'timestamptz', nullable: true })
  webhookSubscriptionExpiresAt: Date | null;

  @Column({ type: 'uuid', nullable: false })
  connectedAccountId: string;

  @ManyToOne(
    () => ConnectedAccountEntity,
    (connectedAccount) => connectedAccount.messageChannels,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'connectedAccountId' })
  connectedAccount: Relation<ConnectedAccountEntity>;

  @OneToMany(
    'MessageFolderEntity',
    (messageFolder: MessageFolderEntity) => messageFolder.messageChannel,
  )
  messageFolders: Relation<MessageFolderEntity[]>;

  // Where work arriving on this channel lands. A shared address is watched by a
  // team, so its mail belongs to a shared inbox rather than to whoever happens
  // to hold the connected account. Null falls back to the routing configured
  // for the kind of work, and then to triage.
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_MESSAGE_CHANNEL_DEFAULT_INBOX_QUEUE_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'uuid', nullable: true })
  defaultInboxQueueId: string | null;

  @ManyToOne(() => InboxQueueEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({
    name: 'defaultInboxQueueId',
    foreignKeyConstraintName: 'FK_MESSAGE_CHANNEL_DEFAULT_INBOX_QUEUE_ID',
  })
  defaultInboxQueue: Relation<InboxQueueEntity> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
