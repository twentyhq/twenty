import {
  Check,
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

import { type ConnectedAccountProvider } from 'twenty-shared/types';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { type ImapSmtpCaldavParams } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

export type ConnectedAccountVisibility = 'user' | 'workspace';

@Entity({ name: 'connectedAccount', schema: 'core' })
@Index('IDX_CONNECTED_ACCOUNT_CONNECTION_PROVIDER_ID', ['connectionProviderId'])
@Index('IDX_CONNECTED_ACCOUNT_APPLICATION_ID', ['applicationId'])
@Check(
  'CHK_connectedAccount_accessToken_encrypted',
  `"accessToken" IS NULL OR "accessToken" LIKE 'enc:v1:%'`,
)
@Check(
  'CHK_connectedAccount_refreshToken_encrypted',
  `"refreshToken" IS NULL OR "refreshToken" LIKE 'enc:v1:%'`,
)
export class ConnectedAccountEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  handle: string;

  @Column({ type: 'varchar', nullable: false })
  provider: ConnectedAccountProvider;

  @Column({ type: 'varchar', nullable: true })
  accessToken: string | null;

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastCredentialsRefreshedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  authFailedAt: Date | null;

  @Column({ type: 'varchar', array: true, nullable: true })
  handleAliases: string[] | null;

  @Column({ type: 'varchar', array: true, nullable: true })
  scopes: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  connectionParameters: ImapSmtpCaldavParams | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastSignedInAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  oidcTokenClaims: Record<string, unknown> | null;

  @Column({ type: 'uuid', nullable: false })
  userWorkspaceId: string;

  @Column({ type: 'uuid', nullable: true })
  connectionProviderId: string | null;

  @ManyToOne(() => ConnectionProviderEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'connectionProviderId' })
  connectionProvider: Relation<ConnectionProviderEntity> | null;

  @Column({ type: 'uuid', nullable: true })
  applicationId: string | null;

  @ManyToOne(() => ApplicationEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'applicationId' })
  application: Relation<ApplicationEntity> | null;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'varchar', nullable: false, default: 'user' })
  visibility: ConnectedAccountVisibility;

  @OneToMany(
    'MessageChannelEntity',
    (messageChannel: MessageChannelEntity) => messageChannel.connectedAccount,
  )
  messageChannels: Relation<MessageChannelEntity[]>;

  @OneToMany(
    'CalendarChannelEntity',
    (calendarChannel: CalendarChannelEntity) =>
      calendarChannel.connectedAccount,
  )
  calendarChannels: Relation<CalendarChannelEntity[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
