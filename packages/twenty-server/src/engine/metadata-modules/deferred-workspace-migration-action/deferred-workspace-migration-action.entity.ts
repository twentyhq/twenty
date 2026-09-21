import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { type WorkspaceMigrationActionHandlerKey } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { type DeferredWorkspaceMigrationActionStatus } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action-status.type';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Index('IDX_DEFERRED_WORKSPACE_MIGRATION_ACTION_WORKSPACE_ID_STATUS', [
  'workspaceId',
  'status',
])
@Entity({ name: 'deferredWorkspaceMigrationAction', schema: 'core' })
export class DeferredWorkspaceMigrationActionEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  applicationUniversalIdentifier: string;

  @Column({ type: 'varchar' })
  actionHandlerKey: WorkspaceMigrationActionHandlerKey;

  @Column({ type: 'jsonb' })
  payload: object;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: DeferredWorkspaceMigrationActionStatus;

  @Column({ type: 'integer', default: 0 })
  attempts: number;

  @Column({ type: 'text', nullable: true })
  lastError: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
