import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineProgressWhereInput } from './pipeline-progress-where.input';
import { Type } from 'class-transformer';

@ArgsType()
export class DeleteManyPipelineProgressArgs {
  @Field(() => PipelineProgressWhereInput, { nullable: true })
  @Type(() => PipelineProgressWhereInput)
  where?: PipelineProgressWhereInput;
}
