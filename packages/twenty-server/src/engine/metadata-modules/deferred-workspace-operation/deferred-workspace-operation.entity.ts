import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { WasRenamedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';
import { type PersistedDeferredWorkspaceOperation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';
import { type DeferredWorkspaceOperationStatus } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation-status.type';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity.type';

@Index('IDX_DEFERRED_WORKSPACE_OPERATION_WORKSPACE_ID_STATUS', [
  'workspaceId',
  'status',
])
@Entity({ name: 'deferredWorkspaceOperation', schema: 'core' })
@WasRenamedInUpgrade([
  {
    previousName: 'deferredWorkspaceMigrationAction',
    upgradeCommandName:
      '2.59.0_RenameDeferredWorkspaceMigrationActionToDeferredWorkspaceOperationFastInstanceCommand_1794508996000',
  },
])
export class DeferredWorkspaceOperationEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  applicationUniversalIdentifier: string;

  @Column({ type: 'varchar' })
  name: PersistedDeferredWorkspaceOperation['name'];

  @Column({ type: 'jsonb' })
  payload: PersistedDeferredWorkspaceOperation['payload'];

  @Column({ type: 'integer' })
  position: number;

  @Column({ type: 'varchar', nullable: true })
  runByVersion: string | null;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: DeferredWorkspaceOperationStatus;

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
