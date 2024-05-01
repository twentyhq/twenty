import { Field, ID, ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { RelationMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-metadata.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export enum RelationMetadataType {
  ONE_TO_ONE = 'ONE_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  MANY_TO_ONE = 'MANY_TO_ONE',
  MANY_TO_MANY = 'MANY_TO_MANY',
}

export enum RelationOnDeleteAction {
  CASCADE = 'CASCADE',
  RESTRICT = 'RESTRICT',
  SET_NULL = 'SET_NULL',
  NO_ACTION = 'NO_ACTION',
}

@Entity('relationMetadata')
@ObjectType()
export class RelationMetadataEntity implements RelationMetadataInterface {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ nullable: false })
  @Field(() => RelationMetadataType)
  relationType: RelationMetadataType;

  @Column({
    nullable: false,
    default: RelationOnDeleteAction.SET_NULL,
    type: 'enum',
    enum: RelationOnDeleteAction,
  })
  @Field(() => String)
  onDeleteAction: RelationOnDeleteAction;

  @Column({ nullable: false, type: 'uuid' })
  @Field(() => String)
  fromObjectMetadataId: string;

  @Column({ nullable: false, type: 'uuid' })
  @Field(() => String)
  toObjectMetadataId: string;

  @Column({ nullable: false, type: 'uuid' })
  @Field(() => String)
  fromFieldMetadataId: string;

  @Column({ nullable: false, type: 'uuid' })
  @Field(() => String)
  toFieldMetadataId: string;

  @Column({ nullable: false, type: 'uuid' })
  @Field(() => String)
  workspaceId: string;

  @ManyToOne(
    () => ObjectMetadataEntity,
    (object: ObjectMetadataEntity) => object.fromRelations,
    {
      onDelete: 'CASCADE',
    },
  )
  fromObjectMetadata: Relation<ObjectMetadataEntity>;

  @ManyToOne(
    () => ObjectMetadataEntity,
    (object: ObjectMetadataEntity) => object.toRelations,
    {
      onDelete: 'CASCADE',
    },
  )
  toObjectMetadata: Relation<ObjectMetadataEntity>;

  @OneToOne(
    () => FieldMetadataEntity,
    (field: FieldMetadataEntity) => field.fromRelationMetadata,
  )
  @JoinColumn()
  fromFieldMetadata: Relation<FieldMetadataEntity>;

  @OneToOne(
    () => FieldMetadataEntity,
    (field: FieldMetadataEntity) => field.toRelationMetadata,
  )
  @JoinColumn()
  toFieldMetadata: Relation<FieldMetadataEntity>;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
