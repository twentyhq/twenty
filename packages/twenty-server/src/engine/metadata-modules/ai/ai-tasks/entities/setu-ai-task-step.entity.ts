import {
  type SetuAiErrorCode,
  type SetuAiResearchBrief,
  type SetuAiTaskPendingInput,
  type SetuAiTaskStepStatus,
} from 'twenty-shared/ai';
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
import { SetuAiTaskRunEntity } from 'src/engine/metadata-modules/ai/ai-tasks/entities/setu-ai-task-run.entity';
import { type SetuAiTaskStepCheckpoint } from 'src/engine/metadata-modules/ai/ai-tasks/types/setu-ai-task-step-checkpoint.type';
import { JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

// One account inside a task. A completed step keeps its brief, so a restart
// or a retry of another step never regenerates it. Workers claim a step with
// a fencing token; every later write from that worker must present it.
@Entity({ name: 'setuAiTaskStep', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_SETU_AI_TASK_TABLES_UPGRADE_COMMAND_NAME,
})
@Index('IDX_SETU_AI_TASK_STEP_TASK_KEY', ['taskId', 'stepKey'], {
  unique: true,
})
@Index('IDX_SETU_AI_TASK_STEP_STATUS', ['status', 'leaseExpiresAt'])
@Index('IDX_SETU_AI_TASK_STEP_WORKSPACE_CREATED', ['workspaceId', 'createdAt'])
export class SetuAiTaskStepEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @Column({ nullable: false, type: 'uuid' })
  taskId: string;

  @ManyToOne(() => SetuAiTaskRunEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Relation<SetuAiTaskRunEntity>;

  @Column({ nullable: false, type: 'varchar' })
  stepKey: string;

  @Column({ nullable: false, type: 'integer' })
  position: number;

  @Column({ nullable: false, type: 'uuid' })
  companyId: string;

  @Column({ nullable: false, type: 'varchar' })
  companyName: string;

  @Column({ nullable: false, type: 'varchar' })
  status: SetuAiTaskStepStatus;

  @Column({ nullable: false, type: 'integer', default: 1 })
  stateVersion: number;

  @Column({ nullable: false, type: 'integer', default: 0 })
  attempts: number;

  @Column({ nullable: false, type: 'jsonb', default: {} })
  checkpoint: JsonbProperty<SetuAiTaskStepCheckpoint>;

  @Column({ nullable: true, type: 'jsonb' })
  brief: JsonbProperty<SetuAiResearchBrief> | null;

  @Column({ nullable: true, type: 'jsonb' })
  pendingInput: JsonbProperty<SetuAiTaskPendingInput> | null;

  @Column({ nullable: true, type: 'varchar' })
  lastRequestId: string | null;

  @Column({ nullable: true, type: 'varchar' })
  errorCode: SetuAiErrorCode | null;

  @Column({ nullable: false, type: 'integer', default: 0 })
  reservedTokens: number;

  @Column({ nullable: false, type: 'integer', default: 0 })
  usedTokens: number;

  @Column({ nullable: true, type: 'varchar' })
  leaseOwner: string | null;

  @Column({ nullable: true, type: 'timestamptz' })
  leaseExpiresAt: Date | null;

  @Column({ nullable: false, type: 'integer', default: 0 })
  fencingToken: number;

  @Column({ nullable: true, type: 'timestamptz' })
  completedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
