import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_CUSTOMER = 'waiting_customer',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TicketChannel {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  CHAT = 'chat',
  PHONE = 'phone',
  FORM = 'form',
  MANUAL = 'manual',
}

export enum TicketCategory {
  BUG = 'bug',
  QUESTION = 'question',
  COMPLAINT = 'complaint',
  BILLING = 'billing',
  FEATURE_REQUEST = 'feature_request',
  OTHER = 'other',
}

@Entity('support_ticket')
@Index(['workspaceId', 'status'])
@Index(['workspaceId', 'assigneeId'])
@Index(['workspaceId', 'accountId'])
export class SupportTicketEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  subject: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Column({ type: 'enum', enum: TicketChannel, default: TicketChannel.EMAIL })
  channel: TicketChannel;

  @Column({ type: 'enum', enum: TicketCategory, default: TicketCategory.QUESTION })
  category: TicketCategory;

  @Column({ nullable: true })
  accountId: string;

  @Column({ nullable: true })
  contactId: string;

  @Column({ nullable: true })
  assigneeId: string;

  @Column({ nullable: true })
  parentTicketId: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'timestamp', nullable: true })
  firstResponseAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'int', nullable: true })
  csatScore: number;

  @Column({ type: 'text', nullable: true })
  csatFeedback: string | undefined;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('sla_policy')
@Index(['workspaceId'])
export class SLAPolicyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'enum', enum: TicketPriority, nullable: false })
  priority: TicketPriority;

  @Column({ type: 'int', nullable: false })
  firstResponseMinutes: number;

  @Column({ type: 'int', nullable: false })
  resolutionMinutes: number;

  @Column({ type: 'int', default: 30 })
  breachAlertMinutesBefore: number;

  @Column({ type: 'simple-json', nullable: true })
  businessHours: { start: string; end: string; timezone: string; workDays: number[] };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('ticket_comment')
@Index(['ticketId'])
export class TicketCommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  ticketId: string;

  @Column({ nullable: false })
  authorId: string;

  @Column({ type: 'text', nullable: false })
  body: string;

  @Column({ type: 'boolean', default: false })
  isInternal: boolean;

  @Column({ type: 'simple-array', nullable: true })
  attachmentIds: string[];

  @CreateDateColumn()
  createdAt: Date;
}
