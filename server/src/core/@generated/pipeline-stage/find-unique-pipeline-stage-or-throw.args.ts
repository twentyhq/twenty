import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { Type } from 'class-transformer';

@ArgsType()
export class FindUniquePipelineStageOrThrowArgs {
  @Field(() => PipelineStageWhereUniqueInput, { nullable: false })
  @Type(() => PipelineStageWhereUniqueInput)
  where!: PipelineStageWhereUniqueInput;
}
