import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';
import { MessageEntity } from 'src/modules/messaging/entities/message.entity'; // Assuming MessageEntity exists or will be created

@Entity('messageAttachment')
@Index('IDX_MESSAGE_ATTACHMENT_WORKSPACE_ID', ['workspaceId'])
@Index('UQ_MESSAGE_ATTACHMENT_FILE_ID', ['fileId'], { unique: true })
export class MessageAttachmentEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  messageId: string;

  @Column({ nullable: false, type: 'uuid' })
  fileId: string;

  @Column({ nullable: false })
  filename: string;

  @Column({ nullable: false })
  mimeType: string;

  @Column({ nullable: false, type: 'bigint' })
  size: number;

  @ManyToOne(() => MessageEntity, (message) => message.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'messageId' })
  message: Relation<MessageEntity>;

  @ManyToOne(() => FileEntity, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'fileId' })
  file: Relation<FileEntity>;
}
