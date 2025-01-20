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

import { RelationMetadataInterfaceV2 } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-metadata-v2.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

export enum RelationMetadataTypeV2 {
  ONE_TO_ONE = 'ONE_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  MANY_TO_ONE = 'MANY_TO_ONE',
  MANY_TO_MANY = 'MANY_TO_MANY',
}

@Entity('relationMetadataV2')
export class RelationMetadataV2Entity implements RelationMetadataInterfaceV2 {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  relationType: RelationMetadataTypeV2;

  @Column({
    nullable: false,
    default: RelationOnDeleteAction.SET_NULL,
    type: 'enum',
    enum: RelationOnDeleteAction,
  })
  onDeleteAction: RelationOnDeleteAction;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  /**
   * ObjectMetadata relation
   */
  @ManyToOne(
    () => ObjectMetadataEntity,
    (object: ObjectMetadataEntity) => object.sourceRelations,
    {
      onDelete: 'CASCADE',
    },
  )
  sourceObjectMetadata: Relation<ObjectMetadataEntity>;

  @Column({ nullable: false, type: 'uuid' })
  sourceObjectMetadataId: string;

  @ManyToOne(
    () => ObjectMetadataEntity,
    (object: ObjectMetadataEntity) => object.targetRelations,
    {
      onDelete: 'CASCADE',
    },
  )
  targetObjectMetadata: Relation<ObjectMetadataEntity>;

  @Column({ nullable: false, type: 'uuid' })
  targetObjectMetadataId: string;

  /**
   * FieldMetadata relation
   */
  @OneToOne(
    () => FieldMetadataEntity,
    (field: FieldMetadataEntity) => field.sourceRelationMetadata,
  )
  @JoinColumn()
  sourceFieldMetadata: Relation<FieldMetadataEntity>;

  @Column({ nullable: false, type: 'uuid' })
  sourceFieldMetadataId: string;

  @OneToOne(
    () => FieldMetadataEntity,
    (field: FieldMetadataEntity) => field.targetRelationMetadata,
  )
  @JoinColumn()
  targetFieldMetadata: Relation<FieldMetadataEntity>;

  @Column({ nullable: false, type: 'uuid' })
  targetFieldMetadataId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
