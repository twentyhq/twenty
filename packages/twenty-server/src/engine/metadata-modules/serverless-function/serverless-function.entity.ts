import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { InputSchema } from 'src/modules/workflow/workflow-builder/types/input-schema.type';

const DEFAULT_SERVERLESS_TIMEOUT_SECONDS = 300; // 5 minutes

export enum ServerlessFunctionSyncStatus {
  NOT_READY = 'NOT_READY',
  READY = 'READY',
}

export enum ServerlessFunctionRuntime {
  NODE18 = 'nodejs18.x',
}

@Entity('serverlessFunction')
export class ServerlessFunctionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  latestVersion: string;

  @Column({ nullable: false, type: 'jsonb', default: [] })
  publishedVersions: string[];

  @Column({ nullable: true, type: 'jsonb' })
  latestVersionInputSchema: InputSchema;

  @Column({ nullable: false, default: ServerlessFunctionRuntime.NODE18 })
  runtime: ServerlessFunctionRuntime;

  @Column({ nullable: false, default: DEFAULT_SERVERLESS_TIMEOUT_SECONDS })
  @Check(`"timeoutSeconds" >= 1 AND "timeoutSeconds" <= 900`)
  timeoutSeconds: number;

  @Column({ nullable: true })
  layerVersion: number;

  @Column({
    nullable: false,
    default: ServerlessFunctionSyncStatus.NOT_READY,
    type: 'enum',
    enum: ServerlessFunctionSyncStatus,
  })
  syncStatus: ServerlessFunctionSyncStatus;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
