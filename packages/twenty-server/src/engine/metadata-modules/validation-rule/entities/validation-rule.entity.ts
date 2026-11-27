/* @license Enterprise */

import {
  type StoredExpressionTree,
  type ValidationRuleBindings,
} from 'twenty-shared/types';
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

import { ADD_VALIDATION_RULE_TABLE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-44/add-validation-rule-table-upgrade-command-name.constant';
import { ADD_VALIDATION_RULE_TREE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-65/add-validation-rule-tree-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { type WasRemovedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-removed-in-upgrade.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

@Entity({ name: 'validationRule', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_VALIDATION_RULE_TABLE_UPGRADE_COMMAND_NAME,
})
@Index('IDX_VALIDATION_RULE_WORKSPACE_ID_OBJECT_METADATA_ID', [
  'workspaceId',
  'objectMetadataId',
])
@Index('IDX_VALIDATION_RULE_ERROR_FIELD_METADATA_ID', ['errorFieldMetadataId'])
export class ValidationRuleEntity
  extends SyncableEntity
  implements Required<ValidationRuleEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @ManyToOne(() => ObjectMetadataEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'objectMetadataId' })
  objectMetadata: Relation<ObjectMetadataEntity>;

  @Column({ nullable: true, type: 'uuid' })
  errorFieldMetadataId: string | null;

  @ManyToOne(() => FieldMetadataEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'errorFieldMetadataId' })
  errorFieldMetadata: Relation<FieldMetadataEntity> | null;

  @Column({ nullable: false, type: 'varchar' })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  // No runtime reads or writes them, the 2-65 conversion reads them with SQL, dropped in 2.66
  @Column({
    nullable: true,
    type: 'text',
    select: false,
    insert: false,
    update: false,
  })
  expression: WasRemovedInUpgrade<string | null>;

  @Column({
    nullable: false,
    type: 'jsonb',
    default: {},
    select: false,
    insert: false,
    update: false,
  })
  bindings: WasRemovedInUpgrade<JsonbProperty<ValidationRuleBindings>>;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_VALIDATION_RULE_TREE_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: true, type: 'jsonb' })
  tree: JsonbProperty<StoredExpressionTree> | null;

  @Column({ nullable: false, type: 'text' })
  message: string;

  @Column({ nullable: false, type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
