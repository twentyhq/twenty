import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_UNIVERSAL_IDENTIFIER_AND_APPLICATION_ID_TO_SEARCH_FIELD_METADATA_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-16/add-universal-identifier-and-application-id-to-search-field-metadata-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'searchFieldMetadata', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName:
    ADD_UNIVERSAL_IDENTIFIER_AND_APPLICATION_ID_TO_SEARCH_FIELD_METADATA_UPGRADE_COMMAND_NAME,
})
@Unique('IDX_SEARCH_FIELD_METADATA_OBJECT_FIELD_UNIQUE', [
  'objectMetadataId',
  'fieldMetadataId',
])
@Index('IDX_SEARCH_FIELD_METADATA_WORKSPACE_ID', ['workspaceId'])
@Index('IDX_SEARCH_FIELD_METADATA_OBJECT_METADATA_ID', ['objectMetadataId'])
export class SearchFieldMetadataEntity extends SyncableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @ManyToOne(
    () => ObjectMetadataEntity,
    (objectMetadata) => objectMetadata.searchFieldMetadatas,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'objectMetadataId' })
  objectMetadata: Relation<ObjectMetadataEntity>;

  @Column({ nullable: false, type: 'uuid' })
  fieldMetadataId: string;

  @ManyToOne(() => FieldMetadataEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fieldMetadataId' })
  fieldMetadata: Relation<FieldMetadataEntity>;

  // Parent TS_VECTOR field this row contributes to. Nullable for now; populated by
  // the 2.16 backfill and enforced NOT NULL in a follow-up slow instance command.
  @Column({ nullable: true, type: 'uuid' })
  tsVectorFieldMetadataId: string | null;

  @ManyToOne(() => FieldMetadataEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'tsVectorFieldMetadataId' })
  tsVectorFieldMetadata: Relation<FieldMetadataEntity> | null;

  @Column({ nullable: false, type: 'float' })
  position: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
