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

import { InputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/input-schema.type';

const DEFAULT_SERVERLESS_TIMEOUT_SECONDS = 300; // 5 minutes

export enum ServerlessFunctionRuntime {
  NODE18 = 'nodejs18.x',
  NODE22 = 'nodejs22.x',
}

@Entity('serverlessFunction')
@Index('IDX_SERVERLESS_FUNCTION_ID_DELETED_AT', ['id', 'deletedAt'])
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

  @Column({ nullable: false, default: ServerlessFunctionRuntime.NODE22 })
  runtime: ServerlessFunctionRuntime;

  @Column({ nullable: false, default: DEFAULT_SERVERLESS_TIMEOUT_SECONDS })
  @Check(`"timeoutSeconds" >= 1 AND "timeoutSeconds" <= 900`)
  timeoutSeconds: number;

  @Column({ nullable: true })
  layerVersion: number;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date;
}
