import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';

@ObjectType()
export class PipelineStageCountAggregate {
  @Field(() => Int, { nullable: false })
  id!: number;

  @Field(() => Int, { nullable: false })
  createdAt!: number;

  @Field(() => Int, { nullable: false })
  updatedAt!: number;

  @Field(() => Int, { nullable: false })
  deletedAt!: number;

  @Field(() => Int, { nullable: false })
  name!: number;

  @Field(() => Int, { nullable: false })
  type!: number;

  @Field(() => Int, { nullable: false })
  color!: number;

  @Field(() => Int, { nullable: false })
  pipelineId!: number;

  @HideField()
  workspaceId!: number;

  @Field(() => Int, { nullable: false })
  _all!: number;
}
