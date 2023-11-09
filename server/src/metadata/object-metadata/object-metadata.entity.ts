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

@Entity('object_metadata')
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
  @Column({ nullable: false, name: 'data_source_id' })
  dataSourceId: string;

  @Field()
  @Column({ nullable: false, name: 'name_singular' })
  nameSingular: string;

  @Field()
  @Column({ nullable: false, name: 'name_plural' })
  namePlural: string;

  @Field()
  @Column({ nullable: false, name: 'label_singular' })
  labelSingular: string;

  @Field()
  @Column({ nullable: false, name: 'label_plural' })
  labelPlural: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'description', type: 'text' })
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'icon' })
  icon: string;

  @Column({ nullable: false, name: 'target_table_name' })
  targetTableName: string;

  @Field()
  @Column({ default: false, name: 'is_custom' })
  isCustom: boolean;

  @Field()
  @Column({ default: false, name: 'is_active' })
  isActive: boolean;

  @Column({ nullable: false, name: 'workspace_id' })
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
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
