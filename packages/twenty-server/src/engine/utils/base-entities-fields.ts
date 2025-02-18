import { Field, ObjectType } from '@nestjs/graphql';

import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType()
export abstract class BaseEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt: Date;
}

@ObjectType()
export abstract class BaseSoftDeleteEntity extends BaseEntity {
  @Field({ nullable: true })
  @DeleteDateColumn({ name: 'deletedAt', type: 'timestamptz' })
  deletedAt: Date;
}
