import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';

@ObjectType()
export class PipelineCount {
  @Field(() => Int, { nullable: false })
  pipelineStages?: number;

  @Field(() => Int, { nullable: false })
  pipelineProgresses?: number;
}
