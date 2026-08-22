import {
  type TimelineActivityAction,
  type TimelineActivityRenderer,
} from 'twenty-shared/timeline';
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

  // The verb the entry describes. Null leaves the label authoritative for a
  // custom renderer instead of selecting built-in action copy.
  @Column({ nullable: true, type: 'varchar' })
  action: TimelineActivityAction | null;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  // Names the frontend component that draws the row. Null falls back to the
  // generic renderer, which needs nothing but the label and icon.
  @Column({ nullable: true, type: 'varchar' })
  renderer: TimelineActivityRenderer | null;

  // The object whose records this entry is about, as a soft reference rather
  // than a relation: it is resolved through the flat maps at write time to pick
  // the type for an event, and null means any object.
  @Column({ nullable: true, type: 'uuid' })
  objectUniversalIdentifier: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
