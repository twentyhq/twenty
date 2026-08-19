import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { type TimelineActivityAction } from 'twenty-shared/timeline';

import { CREATE_TIMELINE_ACTIVITY_RULE_CORE_TABLE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-33/create-timeline-activity-rule-core-table-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type TimelineActivityRuleResolution } from 'src/engine/metadata-modules/timeline-activity-rule/types/timeline-activity-rule-resolution.type';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'timelineActivityRule', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName:
    CREATE_TIMELINE_ACTIVITY_RULE_CORE_TABLE_UPGRADE_COMMAND_NAME,
})
// Postgres treats NULLs as distinct, so the natural key needs two partial
// unique indexes: one for the self rule, one per relation and resolution.
@Index(
  'IDX_TIMELINE_ACTIVITY_RULE_SELF_UNIQUE',
  ['workspaceId', 'objectMetadataId'],
  {
    unique: true,
    where: '"relationFieldMetadataId" IS NULL',
  },
)
@Index(
  'IDX_TIMELINE_ACTIVITY_RULE_RELATION_UNIQUE',
  ['workspaceId', 'objectMetadataId', 'relationFieldMetadataId', 'resolution'],
  { unique: true, where: '"relationFieldMetadataId" IS NOT NULL' },
)
@Index('IDX_TIMELINE_ACTIVITY_RULE_WORKSPACE_ID', ['workspaceId'])
@Index('IDX_TIMELINE_ACTIVITY_RULE_OBJECT_METADATA_ID', ['objectMetadataId'])
@Index('IDX_TIMELINE_ACTIVITY_RULE_RELATION_FIELD_METADATA_ID', [
  'relationFieldMetadataId',
])
export class TimelineActivityRuleEntity extends SyncableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @ManyToOne(() => ObjectMetadataEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'objectMetadataId' })
  objectMetadata: Relation<ObjectMetadataEntity>;

  @Column({ nullable: true, type: 'uuid' })
  relationFieldMetadataId: string | null;

  @ManyToOne(() => FieldMetadataEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'relationFieldMetadataId' })
  relationFieldMetadata: Relation<FieldMetadataEntity> | null;

  @Column({ nullable: false, type: 'text', default: 'MATERIALIZED' })
  resolution: TimelineActivityRuleResolution;

  @Column('text', { array: true, default: [] })
  actions: TimelineActivityAction[];

  @Column('uuid', { array: true, nullable: true })
  triggerFieldMetadataIds: string[] | null;

  @Column({ nullable: false, default: true, type: 'boolean' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
