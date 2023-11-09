import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { FieldMetadataEntity } from './field-metadata.entity';
import { ObjectMetadataEntity } from './object-metadata.entity';

export enum RelationType {
  ONE_TO_ONE = 'ONE_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  MANY_TO_MANY = 'MANY_TO_MANY',
}

@Entity('relationMetadata')
export class RelationMetadataEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  relationType: RelationType;

  @Column({ nullable: false, type: 'uuid' })
  fromObjectMetadataId: string;

  @Column({ nullable: false, type: 'uuid' })
  toObjectMetadataId: string;

  @Column({ nullable: false, type: 'uuid' })
  fromFieldMetadataId: string;

  @Column({ nullable: false, type: 'uuid' })
  toFieldMetadataId: string;

  @Column({ nullable: false })
  workspaceId: string;

  @ManyToOne(
    () => ObjectMetadataEntity,
    (object: ObjectMetadataEntity) => object.fromRelations,
  )
  fromObjectMetadata: ObjectMetadataEntity;

  @ManyToOne(
    () => ObjectMetadataEntity,
    (object: ObjectMetadataEntity) => object.toRelations,
  )
  toObjectMetadata: ObjectMetadataEntity;

  @OneToOne(
    () => FieldMetadataEntity,
    (field: FieldMetadataEntity) => field.fromRelationMetadata,
  )
  @JoinColumn()
  fromFieldMetadata: FieldMetadataEntity;

  @OneToOne(
    () => FieldMetadataEntity,
    (field: FieldMetadataEntity) => field.toRelationMetadata,
  )
  @JoinColumn()
  toFieldMetadata: FieldMetadataEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
