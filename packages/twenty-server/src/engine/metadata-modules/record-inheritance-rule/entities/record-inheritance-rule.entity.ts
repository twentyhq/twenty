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

import { ADD_RECORD_INHERITANCE_RULE_TABLE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-50/add-record-inheritance-rule-table-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

// Records of objectMetadata follow the readability of their parentObjectMetadata
// record, reached through fieldMetadata, then junctionFieldMetadata when the
// relation goes through a junction object
@Entity({ name: 'recordInheritanceRule', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_RECORD_INHERITANCE_RULE_TABLE_UPGRADE_COMMAND_NAME,
})
@Index('IDX_RECORD_INHERITANCE_RULE_WORKSPACE_ID_OBJECT_METADATA_ID', [
  'workspaceId',
  'objectMetadataId',
])
export class RecordInheritanceRuleEntity
  extends SyncableEntity
  implements Required<RecordInheritanceRuleEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @ManyToOne(() => ObjectMetadataEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'objectMetadataId' })
  objectMetadata: Relation<ObjectMetadataEntity>;

  @Column({ nullable: false, type: 'uuid' })
  parentObjectMetadataId: string;

  @ManyToOne(() => ObjectMetadataEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentObjectMetadataId' })
  parentObjectMetadata: Relation<ObjectMetadataEntity>;

  @Column({ nullable: false, type: 'uuid' })
  fieldMetadataId: string;

  @ManyToOne(() => FieldMetadataEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fieldMetadataId' })
  fieldMetadata: Relation<FieldMetadataEntity>;

  @Column({ nullable: true, type: 'uuid' })
  junctionFieldMetadataId: string | null;

  @ManyToOne(() => FieldMetadataEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'junctionFieldMetadataId' })
  junctionFieldMetadata: Relation<FieldMetadataEntity> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
