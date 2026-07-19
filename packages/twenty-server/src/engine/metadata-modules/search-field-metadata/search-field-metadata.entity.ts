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
import { ADD_TS_VECTOR_FIELD_METADATA_ID_TO_SEARCH_FIELD_METADATA_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-18/add-ts-vector-field-metadata-id-to-search-field-metadata-upgrade-command-name.constant';
import { ADD_IS_SYSTEM_SIDE_EFFECT_TO_SEARCH_FIELD_METADATA_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-20/add-is-system-side-effect-to-search-field-metadata-upgrade-command-name.constant';
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

  @ManyToOne(
    () => FieldMetadataEntity,
    (fieldMetadata) => fieldMetadata.searchFieldMetadatas,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'fieldMetadataId' })
  fieldMetadata: Relation<FieldMetadataEntity>;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_TS_VECTOR_FIELD_METADATA_ID_TO_SEARCH_FIELD_METADATA_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: false, type: 'uuid' })
  tsVectorFieldMetadataId: string;

  @ManyToOne(() => FieldMetadataEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tsVectorFieldMetadataId' })
  tsVectorFieldMetadata: Relation<FieldMetadataEntity>;

  @Column({ nullable: false, type: 'float' })
  position: number;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_IS_SYSTEM_SIDE_EFFECT_TO_SEARCH_FIELD_METADATA_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: false, default: true, type: 'boolean' })
  isSystemSideEffect: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
