/* @license Enterprise */

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_RELATED_RECORD_PATH_TABLE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-54/add-related-record-path-table-upgrade-command-name.constant';
import { ADD_RELATED_RECORD_PATH_IS_INHERENT_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-55/add-related-record-path-is-inherent-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'relatedRecordPath', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_RELATED_RECORD_PATH_TABLE_UPGRADE_COMMAND_NAME,
})
// Postgres treats NULLs as distinct, so each path length gets its own unique index.
@Index('IDX_RELATED_RECORD_PATH_UNIQUE_ONE_HOP', ['firstFieldMetadataId'], {
  unique: true,
  where: '"secondFieldMetadataId" IS NULL',
})
@Index(
  'IDX_RELATED_RECORD_PATH_UNIQUE_TWO_HOPS',
  ['firstFieldMetadataId', 'secondFieldMetadataId'],
  {
    unique: true,
    where:
      '"secondFieldMetadataId" IS NOT NULL AND "thirdFieldMetadataId" IS NULL',
  },
)
@Index(
  'IDX_RELATED_RECORD_PATH_UNIQUE_THREE_HOPS',
  ['firstFieldMetadataId', 'secondFieldMetadataId', 'thirdFieldMetadataId'],
  { unique: true, where: '"thirdFieldMetadataId" IS NOT NULL' },
)
@Index('IDX_RELATED_RECORD_PATH_APPLICATION_ID', ['applicationId'])
@Index('IDX_RELATED_RECORD_PATH_OBJECT_METADATA_ID', ['objectMetadataId'])
@Index('IDX_RELATED_RECORD_PATH_FIRST_FIELD_METADATA_ID', [
  'firstFieldMetadataId',
])
@Index('IDX_RELATED_RECORD_PATH_SECOND_FIELD_METADATA_ID', [
  'secondFieldMetadataId',
])
@Index('IDX_RELATED_RECORD_PATH_THIRD_FIELD_METADATA_ID', [
  'thirdFieldMetadataId',
])
export class RelatedRecordPathEntity
  extends SyncableEntity
  implements Required<RelatedRecordPathEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @ManyToOne(() => ObjectMetadataEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'objectMetadataId' })
  objectMetadata: Relation<ObjectMetadataEntity>;

  @Column({ nullable: false, type: 'uuid' })
  firstFieldMetadataId: string;

  @ManyToOne(() => FieldMetadataEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'firstFieldMetadataId' })
  firstFieldMetadata: Relation<FieldMetadataEntity>;

  @Column({ nullable: true, type: 'uuid' })
  secondFieldMetadataId: string | null;

  @ManyToOne(() => FieldMetadataEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'secondFieldMetadataId' })
  secondFieldMetadata: Relation<FieldMetadataEntity> | null;

  @Column({ nullable: true, type: 'uuid' })
  thirdFieldMetadataId: string | null;

  @ManyToOne(() => FieldMetadataEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thirdFieldMetadataId' })
  thirdFieldMetadata: Relation<FieldMetadataEntity> | null;

  // Inherent paths apply however the source record became readable; others only when access starts on it.
  @Column({ nullable: false, type: 'boolean', default: false })
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_RELATED_RECORD_PATH_IS_INHERENT_UPGRADE_COMMAND_NAME,
  })
  isInherent: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
