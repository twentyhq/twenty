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
export class RelationMetadataEntity implements RelationMetadataInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  relationType: RelationMetadataType;

  @Column({
    nullable: false,
    default: RelationOnDeleteAction.SET_NULL,
    type: 'enum',
    enum: RelationOnDeleteAction,
  })
  onDeleteAction: RelationOnDeleteAction;

  @Column({ nullable: false, type: 'uuid' })
  fromObjectMetadataId: string;

  @Column({ nullable: false, type: 'uuid' })
  toObjectMetadataId: string;

  @Column({ nullable: false, type: 'uuid' })
  fromFieldMetadataId: string;

  @Column({ nullable: false, type: 'uuid' })
  toFieldMetadataId: string;

  @Column({ nullable: false, type: 'uuid' })
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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
