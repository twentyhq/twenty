import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  type RecordPermissionPolicyDefinition,
  type RecordPermissionRevisionStatus,
} from 'twenty-shared/types';

import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity.type';

@Entity({ name: 'recordPermissionRevision', schema: 'core' })
@Index(['workspaceId', 'status'])
export class RecordPermissionRevisionEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  definition: RecordPermissionPolicyDefinition;

  @Column({ type: 'varchar', default: 'building' })
  status: RecordPermissionRevisionStatus;

  @Column({ type: 'uuid', nullable: true })
  previousRevisionId: string | null;

  @Column({ type: 'text', nullable: true })
  failureReason: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
