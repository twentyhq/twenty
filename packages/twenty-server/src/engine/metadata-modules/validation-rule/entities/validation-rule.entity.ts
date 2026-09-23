import { type ValidationRuleBindings } from 'twenty-shared/types';
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

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

@Entity({ name: 'validationRule', schema: 'core' })
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

  @Column({ nullable: false, type: 'text' })
  expression: string;

  @Column({ nullable: false, type: 'jsonb', default: {} })
  bindings: JsonbProperty<ValidationRuleBindings>;

  @Column({ nullable: false, type: 'text' })
  message: string;

  @Column({ nullable: false, type: 'boolean', default: true })
  isActive: boolean;

  @Column({ nullable: false, type: 'integer', default: 1 })
  evaluatorVersion: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
