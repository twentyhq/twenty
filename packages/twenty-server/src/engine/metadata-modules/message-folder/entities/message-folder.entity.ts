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

import { MessageFolderPendingSyncAction } from 'twenty-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'messageFolder', schema: 'core' })
export class MessageFolderEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'varchar', nullable: true })
  syncCursor: string | null;

  @Column({ type: 'boolean', nullable: false })
  isSentFolder: boolean;

  @Column({ type: 'boolean', nullable: false })
  isSynced: boolean;

  @Column({ type: 'uuid', nullable: true })
  parentFolderId: string | null;

  @Column({ type: 'varchar', nullable: true })
  externalId: string | null;

  @Column({
    type: 'enum',
    enum: MessageFolderPendingSyncAction,
    nullable: false,
    default: MessageFolderPendingSyncAction.NONE,
  })
  pendingSyncAction: MessageFolderPendingSyncAction;

  @Column({ type: 'uuid', nullable: false })
  messageChannelId: string;

  @ManyToOne(
    () => MessageChannelEntity,
    (messageChannel) => messageChannel.messageFolders,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'messageChannelId' })
  messageChannel: Relation<MessageChannelEntity>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
