import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';

import type { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'workspaceSchemaMigrationLock', schema: 'core' })
export class WorkspaceSchemaMigrationLockEntity {
  @PrimaryColumn({ type: 'uuid' })
  workspaceId: string;

  @ManyToOne('WorkspaceEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @Column({ type: 'timestamptz' })
  startedAt: Date;
}
