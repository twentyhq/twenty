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
import { Authorize, IDField, PagingStrategies, QueryOptions, Relation } from '@ptc-org/nestjs-query-graphql';

import { ObjectMetadata } from 'src/metadata/object-metadata/object-metadata.entity';

export type FieldMetadataTargetColumnMap = {
  [key: string]: string;
};

@ObjectType('field')
@QueryOptions({
  defaultResultSize: 10,
  maxResultsSize: 100,
  disableFilter: true,
  disableSort: true,
})
@Authorize({
  authorize: (context: any) => ({
    workspaceId: { eq: context?.req?.user?.workspace?.id },
  }),
})
@Entity('field_metadata')
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
  @Column({ nullable: false, name: 'display_name' })
  displayName: string;

  @Column({ nullable: false, name: 'target_column_name' })
  targetColumnName: string;

  @Field({ nullable: true})
  @Column({ nullable: true, name: 'description', type: 'text' })
  description: string;

  @Field({ nullable: true})
  @Column({ nullable: true, name: 'icon' })
  icon: string;

  @Field({ nullable: true})
  @Column({ nullable: true, name: 'placeholder' })
  placeholder: string;

  @Column({ nullable: true, name: 'target_column_map', type: 'jsonb' })
  targetColumnMap: FieldMetadataTargetColumnMap;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
