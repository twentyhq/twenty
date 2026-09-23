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
  ServerCronTriggerSettings,
  ServerRouteTriggerSettings,
  ToolTriggerSettings,
  WorkflowActionTriggerSettings,
} from 'twenty-shared/application';

import { ADD_SERVER_CRON_TRIGGER_SETTINGS_TO_LOGIC_FUNCTION_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-43/add-server-cron-trigger-settings-to-logic-function-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
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

@Entity('logicFunction')
@Index('IDX_LOGIC_FUNCTION_ID_DELETED_AT', ['id', 'deletedAt'])
@Index('IDX_LOGIC_FUNCTION_SERVER_CRON_TRIGGER_SETTINGS', ['workspaceId'], {
  where: '"serverCronTriggerSettings" IS NOT NULL AND "deletedAt" IS NULL',
})
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

  @Column({ nullable: false, type: 'boolean', default: true })
  isBuildUpToDate: boolean;

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
  serverRouteTriggerSettings: JsonbProperty<ServerRouteTriggerSettings> | null;

  @Column({ nullable: true, type: 'jsonb' })
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_SERVER_CRON_TRIGGER_SETTINGS_TO_LOGIC_FUNCTION_UPGRADE_COMMAND_NAME,
  })
  serverCronTriggerSettings: JsonbProperty<ServerCronTriggerSettings> | null;

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
