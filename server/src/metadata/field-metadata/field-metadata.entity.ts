import {
  Entity,
  Unique,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { FieldMetadataInterface } from 'src/tenant/schema-builder/interfaces/field-metadata.interface';
import { FieldMetadataTargetColumnMap } from 'src/metadata/field-metadata/interfaces/field-metadata-target-column-map.interface';
import { FieldMetadataDefaultValue } from 'src/metadata/field-metadata/interfaces/field-metadata-default-value.interface';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { RelationMetadataEntity } from 'src/metadata/relation-metadata/relation-metadata.entity';

export enum FieldMetadataType {
  UUID = 'UUID',
  TEXT = 'TEXT',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  NUMBER = 'NUMBER',
  PROBABILITY = 'PROBABILITY',
  ENUM = 'ENUM',
  URL = 'URL',
  MONEY = 'MONEY',
  RELATION = 'RELATION',
}

@Entity('fieldMetadata')
@Unique('IndexOnNameObjectMetadataIdAndWorkspaceIdUnique', [
  'name',
  'objectMetadataId',
  'workspaceId',
])
export class FieldMetadataEntity implements FieldMetadataInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @ManyToOne(() => ObjectMetadataEntity, (object) => object.fields, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'objectMetadataId' })
  object: ObjectMetadataEntity;

  @Column({ nullable: false })
  type: FieldMetadataType;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  label: string;

  @Column({ nullable: false, type: 'jsonb' })
  targetColumnMap: FieldMetadataTargetColumnMap;

  @Column({ nullable: true, type: 'jsonb' })
  defaultValue: FieldMetadataDefaultValue;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column('text', { nullable: true, array: true })
  enums: string[];

  @Column({ default: false })
  isCustom: boolean;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isSystem: boolean;

  @Column({ nullable: true, default: true })
  isNullable: boolean;

  @Column({ nullable: false })
  workspaceId: string;

  @OneToOne(
    () => RelationMetadataEntity,
    (relation: RelationMetadataEntity) => relation.fromFieldMetadata,
  )
  fromRelationMetadata: RelationMetadataEntity;

  @OneToOne(
    () => RelationMetadataEntity,
    (relation: RelationMetadataEntity) => relation.toFieldMetadata,
  )
  toRelationMetadata: RelationMetadataEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
