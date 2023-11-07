import { ObjectType, ID, Field } from '@nestjs/graphql';

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
import {
  Authorize,
  IDField,
  QueryOptions,
  Relation,
} from '@ptc-org/nestjs-query-graphql';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadata } from 'src/metadata/object-metadata/object-metadata.entity';

export enum RelationType {
  ONE_TO_ONE = 'ONE_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  MANY_TO_MANY = 'MANY_TO_MANY',
}

@Entity('relationMetadata')
@ObjectType('relation')
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
@Relation('fromObjectMetadata', () => ObjectMetadata)
@Relation('toObjectMetadata', () => ObjectMetadata)
export class RelationMetadata {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ nullable: false })
  relationType: RelationType;

  @Field()
  @Column({ nullable: false, type: 'uuid' })
  fromObjectMetadataId: string;

  @Field()
  @Column({ nullable: false, type: 'uuid' })
  toObjectMetadataId: string;

  @Field()
  @Column({ nullable: false, type: 'uuid' })
  fromFieldMetadataId: string;

  @Field()
  @Column({ nullable: false, type: 'uuid' })
  toFieldMetadataId: string;

  @Column({ nullable: false })
  workspaceId: string;

  @ManyToOne(() => ObjectMetadata, (object) => object.fromRelations)
  fromObjectMetadata: ObjectMetadata;

  @ManyToOne(() => ObjectMetadata, (object) => object.toRelations)
  toObjectMetadata: ObjectMetadata;

  @OneToOne(() => FieldMetadata, (field) => field.fromRelationMetadata)
  @JoinColumn()
  fromFieldMetadata: FieldMetadata;

  @OneToOne(() => FieldMetadata, (field) => field.toRelationMetadata)
  @JoinColumn()
  toFieldMetadata: FieldMetadata;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
