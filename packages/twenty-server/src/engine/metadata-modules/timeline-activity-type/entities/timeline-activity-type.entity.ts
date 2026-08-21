import { type TimelineActivityAction } from 'twenty-shared/timeline';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'timelineActivityType', schema: 'core' })
@Unique('IDX_TIMELINE_ACTIVITY_TYPE_NAME_APPLICATION_WORKSPACE_UNIQUE', [
  'name',
  'applicationId',
  'workspaceId',
])
export class TimelineActivityTypeEntity
  extends SyncableEntity
  implements Required<TimelineActivityTypeEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'varchar' })
  name: string;

  @Column({ nullable: false, type: 'varchar' })
  label: string;

  // Selects the built-in timeline row renderer. Null for an application-declared
  // type, which renders from its label and icon alone.
  @Column({ nullable: true, type: 'varchar' })
  action: TimelineActivityAction | null;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
