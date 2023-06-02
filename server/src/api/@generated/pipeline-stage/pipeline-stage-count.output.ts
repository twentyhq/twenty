import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';

@ObjectType()
export class PipelineStageCount {
  @Field(() => Int, { nullable: false })
  pipelineAssociations?: number;
}
