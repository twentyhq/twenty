import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import {
  Authorize,
  BeforeCreateOne,
  IDField,
  QueryOptions,
  Relation,
} from '@ptc-org/nestjs-query-graphql';

import { FieldMetadataInterface } from 'src/tenant/schema-builder/interfaces/field-metadata.interface';

import { ObjectMetadata } from 'src/metadata/object-metadata/object-metadata.entity';
import { RelationMetadata } from 'src/metadata/relation-metadata/relation-metadata.entity';

import { BeforeCreateOneField } from './hooks/before-create-one-field.hook';
import { FieldMetadataTargetColumnMap } from './interfaces/field-metadata-target-column-map.interface';

export enum FieldMetadataType {
  UUID = 'uuid',
  TEXT = 'TEXT',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  NUMBER = 'NUMBER',
  ENUM = 'ENUM',
  URL = 'URL',
  MONEY = 'MONEY',
  RELATION = 'RELATION',
}

registerEnumType(FieldMetadataType, {
  name: 'FieldMetadataType',
  description: 'Type of the field',
});

@Entity('field_metadata')
@ObjectType('field')
@BeforeCreateOne(BeforeCreateOneField)
@Authorize({
  authorize: (context: any) => ({
    workspaceId: { eq: context?.req?.user?.workspace?.id },
  }),
})
@QueryOptions({
  defaultResultSize: 10,
  disableFilter: true,
  disableSort: true,
  maxResultsSize: 1000,
})
@Unique('IndexOnNameObjectIdAndWorkspaceIdUnique', [
  'name',
  'objectId',
  'workspaceId',
])
@Relation('toRelationMetadata', () => RelationMetadata, { nullable: true })
@Relation('fromRelationMetadata', () => RelationMetadata, { nullable: true })
export class FieldMetadata implements FieldMetadataInterface {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, name: 'object_id' })
  objectId: string;

  @Field(() => FieldMetadataType)
  @Column({ nullable: false })
  type: FieldMetadataType;

  @Field()
  @Column({ nullable: false })
  name: string;

  @Field()
  @Column({ nullable: false })
  label: string;

  @Column({ nullable: false, name: 'target_column_map', type: 'jsonb' })
  targetColumnMap: FieldMetadataTargetColumnMap;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'description', type: 'text' })
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'icon' })
  icon: string;

  @Field({ nullable: true, deprecationReason: 'Use label name instead' })
  placeholder: string;

  @Column('text', { nullable: true, array: true })
  enums: string[];

  @Field()
  @Column({ default: false, name: 'is_custom' })
  isCustom: boolean;

  @Field()
  @Column({ default: false, name: 'is_active' })
  isActive: boolean;

  @Field()
  @Column({ nullable: true, default: true, name: 'is_nullable' })
  isNullable: boolean;

  @Column({ nullable: false, name: 'workspace_id' })
  workspaceId: string;

  @ManyToOne(() => ObjectMetadata, (object) => object.fields, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'object_id' })
  object: ObjectMetadata;

  @OneToOne(() => RelationMetadata, (relation) => relation.fromFieldMetadata)
  fromRelationMetadata: RelationMetadata;

  @OneToOne(() => RelationMetadata, (relation) => relation.toFieldMetadata)
  toRelationMetadata: RelationMetadata;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
