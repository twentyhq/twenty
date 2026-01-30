import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';
import { MessageThreadEntity } from 'src/modules/messaging/entities/message-thread.entity'; // Assuming MessageThreadEntity exists
import { MessageParticipantEntity } from 'src/modules/messaging/entities/message-participant.entity'; // Assuming MessageParticipantEntity exists
import { MessageChannelMessageAssociationEntity } from 'src/modules/messaging/entities/message-channel-message-association.entity'; // Assuming MessageChannelMessageAssociationEntity exists
import { MessageAttachmentEntity } from 'src/modules/messaging/entities/message-attachment.entity';

@Entity('message')
@Index('IDX_MESSAGE_WORKSPACE_ID', ['workspaceId'])
@Index('UQ_MESSAGE_HEADER_ID', ['headerMessageId'], { unique: true })
export class MessageEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  headerMessageId: string | null;

  @Column({ nullable: true })
  subject: string | null;

  @Column({ nullable: true, type: 'text' })
  text: string | null;

  @Column({ nullable: true, type: 'timestamptz' })
  receivedAt: Date | null;

  @Column({ nullable: true, type: 'uuid' })
  messageThreadId: string | null;

  @ManyToOne(() => MessageThreadEntity, (thread) => thread.messages, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'messageThreadId' })
  messageThread: Relation<MessageThreadEntity> | null;

  @OneToMany(
    () => MessageParticipantEntity,
    (participant) => participant.message,
  )
  messageParticipants: Relation<MessageParticipantEntity[]>;

  @OneToMany(
    () => MessageChannelMessageAssociationEntity,
    (association) => association.message,
  )
  messageChannelMessageAssociations: Relation<
    MessageChannelMessageAssociationEntity[]
  >;

  @OneToMany(
    () => MessageAttachmentEntity,
    (attachment) => attachment.message,
  )
  attachments: Relation<MessageAttachmentEntity[]>;
}
