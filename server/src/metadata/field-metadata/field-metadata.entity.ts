import { Field, ID, ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import {
  Authorize,
  BeforeCreateOne,
  IDField,
  QueryOptions,
} from '@ptc-org/nestjs-query-graphql';

import { ObjectMetadata } from 'src/metadata/object-metadata/object-metadata.entity';

import { BeforeCreateOneField } from './hooks/before-create-one-field.hook';

export type FieldMetadataTargetColumnMap = {
  [key: string]: string;
};
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
})
@Unique('IndexOnNameObjectIdAndWorkspaceIdUnique', [
  'name',
  'objectId',
  'workspaceId',
])
export class FieldMetadata {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, name: 'object_id' })
  objectId: string;

  @Field()
  @Column({ nullable: false })
  type: string;

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

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
