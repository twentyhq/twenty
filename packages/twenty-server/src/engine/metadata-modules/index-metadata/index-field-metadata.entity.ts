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

import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import type { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';

@Entity({ name: 'indexFieldMetadata', schema: 'core' })
export class IndexFieldMetadataEntity implements Required<IndexFieldMetadataEntity> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  @Index()
  workspaceId: string;

  @ManyToOne('WorkspaceEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @Column({ nullable: false })
  indexMetadataId: string;

  @ManyToOne(
    () => IndexMetadataEntity,
    (indexMetadata) => indexMetadata.indexFieldMetadatas,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  indexMetadata: Relation<IndexMetadataEntity>;

  @Column({ nullable: false })
  @Index('IDX_INDEX_FIELD_METADATA_FIELD_METADATA_ID', ['fieldMetadataId'])
  fieldMetadataId: string;

  @ManyToOne(
    () => FieldMetadataEntity,
    (fieldMetadata) => fieldMetadata.indexFieldMetadatas,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  fieldMetadata: Relation<FieldMetadataEntity>;

  @Column({ nullable: false })
  order: number;

  // Null for scalar/relation fields. Set to the composite sub-property name
  // (e.g. 'addressCity') when the index targets a single column of a
  // composite-type parent.
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      '2.8.0_AddSubFieldNameToIndexFieldMetadataFastInstanceCommand_1798200000000',
  })
  @Column({ type: 'text', nullable: true })
  subFieldName: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
