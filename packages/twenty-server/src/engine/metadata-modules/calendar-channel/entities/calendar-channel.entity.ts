import { registerEnumType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import {
  CalendarChannelContactAutoCreationPolicy,
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  CalendarChannelVisibility,
} from 'twenty-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

registerEnumType(CalendarChannelVisibility, {
  name: 'CalendarChannelVisibility',
});
registerEnumType(CalendarChannelSyncStatus, {
  name: 'CalendarChannelSyncStatus',
});
registerEnumType(CalendarChannelSyncStage, {
  name: 'CalendarChannelSyncStage',
});
registerEnumType(CalendarChannelContactAutoCreationPolicy, {
  name: 'CalendarChannelContactAutoCreationPolicy',
});

@Entity({ name: 'calendarChannel', schema: 'core' })
export class CalendarChannelEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  handle: string;

  @Column({
    type: 'enum',
    enum: CalendarChannelSyncStatus,
    nullable: false,
    default: CalendarChannelSyncStatus.NOT_SYNCED,
  })
  syncStatus: CalendarChannelSyncStatus;

  @Column({
    type: 'enum',
    enum: CalendarChannelSyncStage,
    nullable: false,
  })
  syncStage: CalendarChannelSyncStage;

  @Column({
    type: 'enum',
    enum: CalendarChannelVisibility,
    nullable: false,
  })
  visibility: CalendarChannelVisibility;

  @Column({ type: 'boolean', nullable: false, default: true })
  isContactAutoCreationEnabled: boolean;

  @Column({
    type: 'enum',
    enum: CalendarChannelContactAutoCreationPolicy,
    nullable: false,
    default:
      CalendarChannelContactAutoCreationPolicy.AS_PARTICIPANT_AND_ORGANIZER,
  })
  contactAutoCreationPolicy: CalendarChannelContactAutoCreationPolicy;

  @Column({ type: 'boolean', nullable: false, default: true })
  isSyncEnabled: boolean;

  @Column({ type: 'varchar', nullable: true })
  syncCursor: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  syncedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  syncStageStartedAt: Date | null;

  @Column({ type: 'integer', nullable: false, default: 0 })
  throttleFailureCount: number;

  @Column({ type: 'uuid', nullable: false })
  connectedAccountId: string;

  @ManyToOne(
    () => ConnectedAccountEntity,
    (connectedAccount) => connectedAccount.calendarChannels,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'connectedAccountId' })
  connectedAccount: Relation<ConnectedAccountEntity>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
