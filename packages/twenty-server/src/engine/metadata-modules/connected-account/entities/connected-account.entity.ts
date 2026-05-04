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

import { type ConnectedAccountProvider } from 'twenty-shared/types';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationOAuthProviderEntity } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.entity';
import { type ImapSmtpCaldavParams } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

// Distinguishes who can use this credential. Named `visibility` (not
// `scope`) so it doesn't clash with the OAuth `scopes` array on the same
// row — those are unrelated concepts that used to differ by one letter.
export type ConnectedAccountVisibility = 'user' | 'workspace';

@Entity({ name: 'connectedAccount', schema: 'core' })
@Index('IDX_CONNECTED_ACCOUNT_APP_OAUTH_PROVIDER_ID', [
  'applicationConnectionProviderId',
])
@Index('IDX_CONNECTED_ACCOUNT_APPLICATION_ID', ['applicationId'])
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

  @Column({ type: 'uuid', nullable: true, name: 'applicationOAuthProviderId' })
  applicationConnectionProviderId: string | null;

  @ManyToOne(() => ApplicationOAuthProviderEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'applicationOAuthProviderId' })
  applicationConnectionProvider: Relation<ApplicationOAuthProviderEntity> | null;

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
