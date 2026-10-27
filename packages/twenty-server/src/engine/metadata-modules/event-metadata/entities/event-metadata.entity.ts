import {
  type EventCapabilitiesManifest,
  type EventPropertyManifest,
} from 'twenty-shared/application';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_EVENT_METADATA_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-53/add-event-metadata-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'eventMetadata', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_EVENT_METADATA_UPGRADE_COMMAND_NAME,
})
@Unique('IDX_EVENT_METADATA_NAME_APPLICATION_UNIQUE', ['name', 'applicationId'])
@Index('IDX_EVENT_METADATA_APPLICATION_ID', ['applicationId'])
export class EventMetadataEntity
  extends SyncableEntity
  implements Required<EventMetadataEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'varchar' })
  name: string;

  @Column({ nullable: false, type: 'varchar' })
  label: string;

  @Column({ nullable: true, type: 'varchar' })
  description: string | null;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @Column({ nullable: false, type: 'jsonb', default: [] })
  properties: EventPropertyManifest[];

  @Column({ nullable: false, type: 'jsonb', default: {} })
  capabilities: EventCapabilitiesManifest;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
