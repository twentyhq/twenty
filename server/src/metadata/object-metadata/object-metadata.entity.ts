import { ObjectType, ID, Field } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import {
  Authorize,
  BeforeCreateOne,
  CursorConnection,
  IDField,
  QueryOptions,
} from '@ptc-org/nestjs-query-graphql';

import { ObjectMetadataInterface } from 'src/tenant/schema-builder/interfaces/object-metadata.interface';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadata } from 'src/metadata/relation-metadata/relation-metadata.entity';

import { BeforeCreateOneObject } from './hooks/before-create-one-object.hook';

@Entity('objectMetadata')
@ObjectType('object')
@BeforeCreateOne(BeforeCreateOneObject)
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
@CursorConnection('fields', () => FieldMetadata)
@Unique('IndexOnNameSingularAndWorkspaceIdUnique', [
  'nameSingular',
  'workspaceId',
])
@Unique('IndexOnNamePluralAndWorkspaceIdUnique', ['namePlural', 'workspaceId'])
export class ObjectMetadata implements ObjectMetadataInterface {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ nullable: false, type: 'uuid' })
  dataSourceMetadataId: string;

  @Field()
  @Column({ nullable: false })
  nameSingular: string;

  @Field()
  @Column({ nullable: false })
  namePlural: string;

  @Field()
  @Column({ nullable: false })
  labelSingular: string;

  @Field()
  @Column({ nullable: false })
  labelPlural: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: false })
  targetTableName: string;

  @Field()
  @Column({ default: false })
  isCustom: boolean;

  @Field()
  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: false })
  workspaceId: string;

  @OneToMany(() => FieldMetadata, (field) => field.object, {
    cascade: true,
  })
  fields: FieldMetadata[];

  @OneToMany(() => RelationMetadata, (relation) => relation.fromObjectMetadata)
  fromRelations: RelationMetadata[];

  @OneToMany(() => RelationMetadata, (relation) => relation.toObjectMetadata)
  toRelations: RelationMetadata[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
