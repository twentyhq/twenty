import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { registerEnumType } from '@nestjs/graphql';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import { WebhookSubscriptionChannelType } from 'src/engine/metadata-modules/connected-account-webhook-subscription/enums/webhook-subscription-channel-type.enum';
import { WebhookSubscriptionStatus } from 'src/engine/metadata-modules/connected-account-webhook-subscription/enums/webhook-subscription-status.enum';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

registerEnumType(WebhookSubscriptionChannelType, {
  name: 'WebhookSubscriptionChannelType',
});
registerEnumType(WebhookSubscriptionStatus, {
  name: 'WebhookSubscriptionStatus',
});

@Entity({ name: 'connectedAccountWebhookSubscription', schema: 'core' })
@Unique('UQ_WEBHOOK_SUBSCRIPTION_ACCOUNT_CHANNEL_TYPE', [
  'connectedAccountId',
  'channelType',
])
@Index('IDX_WEBHOOK_SUBSCRIPTION_STATUS_EXPIRES_AT', ['status', 'expiresAt'])
@Index('IDX_WEBHOOK_SUBSCRIPTION_EXTERNAL_SUBSCRIPTION_ID', [
  'externalSubscriptionId',
])
export class ConnectedAccountWebhookSubscriptionEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  connectedAccountId: string;

  @ManyToOne(() => ConnectedAccountEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'connectedAccountId' })
  connectedAccount: Relation<ConnectedAccountEntity>;

  @Column({
    type: 'enum',
    enum: WebhookSubscriptionChannelType,
    nullable: false,
  })
  channelType: WebhookSubscriptionChannelType;

  @Column({ type: 'uuid', nullable: true })
  messageChannelId: string | null;

  @ManyToOne(() => MessageChannelEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'messageChannelId' })
  messageChannel: Relation<MessageChannelEntity> | null;

  @Column({ type: 'uuid', nullable: true })
  calendarChannelId: string | null;

  @ManyToOne(() => CalendarChannelEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'calendarChannelId' })
  calendarChannel: Relation<CalendarChannelEntity> | null;

  @Column({ type: 'varchar', nullable: true })
  externalSubscriptionId: string | null;

  @Column({ type: 'varchar', nullable: true })
  externalResourceId: string | null;

  @Column({ type: 'varchar', nullable: false })
  clientState: string;

  @Column({
    type: 'enum',
    enum: WebhookSubscriptionStatus,
    nullable: false,
    default: WebhookSubscriptionStatus.PENDING,
  })
  status: WebhookSubscriptionStatus;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
