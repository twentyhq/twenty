import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_FIELD_METADATA_OPTION_TABLE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-56/add-field-metadata-option-table-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { OverridableEntity } from 'src/engine/workspace-manager/types/overridable-entity.type';

export type FieldMetadataOptionOverrides = {
  label?: string;
  color?: string | null;
  position?: number;
  isActive?: boolean;
};

// Positions may tie across apps; only values are unique per field.
@Entity({ name: 'fieldMetadataOption', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_FIELD_METADATA_OPTION_TABLE_UPGRADE_COMMAND_NAME,
})
@Index('IDX_FIELD_METADATA_OPTION_APPLICATION_ID', ['applicationId'])
// Deferred so one migration can swap or shift values across a field's options.
@Unique(
  'IDX_FIELD_METADATA_OPTION_FIELD_METADATA_ID_VALUE_UNIQUE',
  ['fieldMetadataId', 'value'],
  { deferrable: 'INITIALLY DEFERRED' },
)
export class FieldMetadataOptionEntity
  extends OverridableEntity<FieldMetadataOptionOverrides>
  implements Required<FieldMetadataOptionEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  fieldMetadataId: string;

  @ManyToOne(
    () => FieldMetadataEntity,
    (fieldMetadata) => fieldMetadata.fieldMetadataOptions,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'fieldMetadataId' })
  fieldMetadata: Relation<FieldMetadataEntity>;

  // The Postgres enum label; it identifies stored records, so it is never overridable.
  @Column({ nullable: false, type: 'varchar' })
  value: string;

  @Column({ nullable: false, type: 'varchar' })
  label: string;

  @Column({ nullable: true, type: 'varchar' })
  color: string | null;

  @Column({ nullable: false, type: 'double precision', default: 0 })
  position: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
