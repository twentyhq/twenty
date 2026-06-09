import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  CronTriggerSettings,
  DatabaseEventTriggerSettings,
  HttpRouteTriggerSettings,
  ToolTriggerSettings,
  WorkflowActionTriggerSettings,
} from 'twenty-shared/application';

import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

const DEFAULT_LOGIC_FUNCTION_TIMEOUT_SECONDS = 300; // 5 minutes

export enum LogicFunctionRuntime {
  NODE18 = 'nodejs18.x',
  NODE22 = 'nodejs22.x',
}

export enum LogicFunctionExecutionMode {
  LIVE = 'LIVE',
  PREBUILT = 'PREBUILT',
}

export enum LogicFunctionBuildStatus {
  NOT_BUILT = 'NOT_BUILT', // source not compiled to a built artifact yet
  CODE_BUILT = 'CODE_BUILT', // built from source; not yet deployed to the executor (reserved for PR2)
  READY = 'READY', // ready to run in its execution mode (LIVE: built; PREBUILT: deployed w/ matching checksum)
  DEPLOY_FAILED = 'DEPLOY_FAILED', // deploying the built artifact to the executor failed (reserved for PR2)
}

@Entity('logicFunction')
@Index('IDX_LOGIC_FUNCTION_ID_DELETED_AT', ['id', 'deletedAt'])
export class LogicFunctionEntity
  extends SyncableEntity
  implements Required<LogicFunctionEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  sourceHandlerPath: string;

  @Column({ nullable: false })
  builtHandlerPath: string;

  @Column({ nullable: false })
  handlerName: string;

  @Column({ nullable: true, type: 'varchar' })
  description: string | null;

  @Column({ nullable: false, default: LogicFunctionRuntime.NODE22 })
  runtime: LogicFunctionRuntime;

  @Column({ nullable: false, default: DEFAULT_LOGIC_FUNCTION_TIMEOUT_SECONDS })
  @Check(`"timeoutSeconds" >= 1 AND "timeoutSeconds" <= 900`)
  timeoutSeconds: number;

  @Column({ nullable: true, type: 'text' })
  checksum: string | null;

  /** @deprecated use buildStatus. Kept in sync for one release. */
  @Column({ nullable: false, type: 'boolean', default: true })
  isBuildUpToDate: boolean;

  @Column({
    type: 'enum',
    enum: LogicFunctionBuildStatus,
    default: LogicFunctionBuildStatus.READY,
    nullable: false,
  })
  buildStatus: LogicFunctionBuildStatus;

  @Column({
    type: 'enum',
    enum: LogicFunctionExecutionMode,
    default: LogicFunctionExecutionMode.LIVE,
    nullable: false,
  })
  executionMode: LogicFunctionExecutionMode;

  @Column({ nullable: true, type: 'jsonb' })
  cronTriggerSettings: JsonbProperty<CronTriggerSettings> | null;

  @Column({ nullable: true, type: 'jsonb' })
  databaseEventTriggerSettings: JsonbProperty<DatabaseEventTriggerSettings> | null;

  @Column({ nullable: true, type: 'jsonb' })
  httpRouteTriggerSettings: JsonbProperty<HttpRouteTriggerSettings> | null;

  @Column({ nullable: true, type: 'jsonb' })
  toolTriggerSettings: JsonbProperty<ToolTriggerSettings> | null;

  @Column({ nullable: true, type: 'jsonb' })
  workflowActionTriggerSettings: JsonbProperty<WorkflowActionTriggerSettings> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
