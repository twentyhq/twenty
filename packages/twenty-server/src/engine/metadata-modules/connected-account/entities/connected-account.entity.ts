import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'connectedAccount', schema: 'core' })
export class ConnectedAccountEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  handle: string;

  @Column({ type: 'varchar', nullable: false })
  provider: string;

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
  connectionParameters: Record<string, unknown> | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastSignedInAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  oidcTokenClaims: Record<string, unknown> | null;

  @Column({ type: 'uuid', nullable: false })
  userWorkspaceId: string;

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
