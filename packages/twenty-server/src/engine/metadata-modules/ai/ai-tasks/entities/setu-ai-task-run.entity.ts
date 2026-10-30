import { type SetuAiErrorCode, type SetuAiTaskStatus } from 'twenty-shared/ai';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_SETU_AI_TASK_TABLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-44/add-setu-ai-task-tables-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type SetuAiTaskRequest } from 'src/engine/metadata-modules/ai/ai-tasks/types/setu-ai-task-request.type';
import { type SetuAiTaskUsage } from 'src/engine/metadata-modules/ai/ai-tasks/types/setu-ai-task-usage.type';
import { JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

// A background task started from chat. Its status is derived from its steps
// and stored so the dispatcher can find work without reading every step.
// Threads are referenced by id only, because history lives in workspace
// objects rather than in a core table.
@Entity({ name: 'setuAiTaskRun', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_SETU_AI_TASK_TABLES_UPGRADE_COMMAND_NAME,
})
@Index(
  'IDX_SETU_AI_TASK_RUN_DEDUPLICATION_KEY',
  ['workspaceId', 'deduplicationKey'],
  { unique: true },
)
@Index('IDX_SETU_AI_TASK_RUN_INITIATOR_STATUS', [
  'workspaceId',
  'initiatorUserWorkspaceId',
  'status',
])
@Index('IDX_SETU_AI_TASK_RUN_STATUS', ['status'])
export class SetuAiTaskRunEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @Column({ nullable: true, type: 'uuid' })
  threadId: string | null;

  @Column({ nullable: false, type: 'uuid' })
  initiatorUserWorkspaceId: string;

  @Column({ nullable: false, type: 'varchar' })
  kind: 'account_research';

  @Column({ nullable: false, type: 'jsonb' })
  request: JsonbProperty<SetuAiTaskRequest>;

  @Column({ nullable: false, type: 'varchar' })
  status: SetuAiTaskStatus;

  @Column({ nullable: false, type: 'integer', default: 1 })
  stateVersion: number;

  @Column({ nullable: false, type: 'varchar' })
  deduplicationKey: string;

  @Column({ nullable: false, type: 'integer' })
  policyVersion: number;

  @Column({ nullable: false, type: 'varchar' })
  modelId: string;

  @Column({ nullable: false, type: 'integer' })
  tokenLimit: number;

  @Column({ nullable: false, type: 'jsonb' })
  usage: JsonbProperty<SetuAiTaskUsage>;

  @Column({ nullable: true, type: 'varchar' })
  errorCode: SetuAiErrorCode | null;

  @Column({ nullable: true, type: 'varchar' })
  cancelRequestId: string | null;

  @Column({ nullable: true, type: 'timestamptz' })
  cancelRequestedAt: Date | null;

  @Column({ nullable: true, type: 'timestamptz' })
  finishedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
