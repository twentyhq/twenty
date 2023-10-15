import { Field, ID, ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
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
  maxResultsSize: 100,
  disableFilter: true,
  disableSort: true,
})
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
  @Column({ nullable: false, name: 'name_singular' })
  nameSingular: string;

  @Field()
  @Column({ nullable: true, name: 'name_plural' })
  namePlural: string;

  @Field()
  @Column({ nullable: false, name: 'label_singular' })
  labelSingular: string;

  @Field()
  @Column({ nullable: true, name: 'label_plural' })
  labelPlural: string;

  @Column({ nullable: false, name: 'target_column_map', type: 'jsonb' })
  targetColumnMap: FieldMetadataTargetColumnMap;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'description', type: 'text' })
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'icon' })
  icon: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'placeholder' })
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

  @ManyToOne(() => ObjectMetadata, (object) => object.fields)
  @JoinColumn({ name: 'object_id' })
  object: ObjectMetadata;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
