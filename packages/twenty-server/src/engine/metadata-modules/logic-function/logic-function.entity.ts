import { HTTPMethod } from 'twenty-shared/types';
import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';
import { LogicFunctionLayerEntity } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

export type CronTriggerSettings = {
  pattern: string;
};

export type DatabaseEventTriggerSettings = {
  eventName: string;
  updatedFields?: string[];
};

export type HttpRouteTriggerSettings = {
  path: string;
  httpMethod: HTTPMethod;
  isAuthRequired: boolean;
  forwardedRequestHeaders?: string[];
};

const DEFAULT_LOGIC_FUNCTION_TIMEOUT_SECONDS = 300; // 5 minutes

export enum LogicFunctionRuntime {
  NODE18 = 'nodejs18.x',
  NODE22 = 'nodejs22.x',
}

export const DEFAULT_SOURCE_HANDLER_PATH = 'src/index.ts';
export const DEFAULT_BUILT_HANDLER_PATH = 'index.mjs';
export const DEFAULT_HANDLER_NAME = 'main';

@Entity('logicFunction')
@Index('IDX_LOGIC_FUNCTION_ID_DELETED_AT', ['id', 'deletedAt'])
@Index('IDX_LOGIC_FUNCTION_LAYER_ID', ['logicFunctionLayerId'])
export class LogicFunctionEntity
  extends SyncableEntity
  implements Required<LogicFunctionEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, default: DEFAULT_SOURCE_HANDLER_PATH })
  sourceHandlerPath: string;

  @Column({ nullable: false, default: DEFAULT_BUILT_HANDLER_PATH })
  builtHandlerPath: string;

  @Column({ nullable: false, default: DEFAULT_HANDLER_NAME })
  handlerName: string;

  @Column({ nullable: true, type: 'varchar' })
  description: string | null;

  @Column({ nullable: true, type: 'varchar' })
  latestVersion: string | null;

  @Column({ nullable: false, type: 'jsonb', default: [] })
  publishedVersions: JsonbProperty<string[]>;

  @Column({ nullable: false, default: LogicFunctionRuntime.NODE22 })
  runtime: LogicFunctionRuntime;

  @Column({ nullable: false, default: DEFAULT_LOGIC_FUNCTION_TIMEOUT_SECONDS })
  @Check(`"timeoutSeconds" >= 1 AND "timeoutSeconds" <= 900`)
  timeoutSeconds: number;

  @Column({ nullable: true, type: 'text' })
  checksum: string | null;

  @Column({ nullable: true, type: 'jsonb' })
  toolInputSchema: JsonbProperty<object> | null;

  @Column({ nullable: false, default: false })
  isTool: boolean;

  @Column({ nullable: false, type: 'uuid' })
  logicFunctionLayerId: string;

  @ManyToOne(
    () => LogicFunctionLayerEntity,
    (logicFunctionLayer) => logicFunctionLayer.logicFunctions,
    { nullable: false },
  )
  @JoinColumn({ name: 'logicFunctionLayerId' })
  logicFunctionLayer: Relation<LogicFunctionLayerEntity>;

  @Column({ nullable: true, type: 'jsonb' })
  cronTriggerSettings: JsonbProperty<CronTriggerSettings> | null;

  @Column({ nullable: true, type: 'jsonb' })
  databaseEventTriggerSettings: JsonbProperty<DatabaseEventTriggerSettings> | null;

  @Column({ nullable: true, type: 'jsonb' })
  httpRouteTriggerSettings: JsonbProperty<HttpRouteTriggerSettings> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
