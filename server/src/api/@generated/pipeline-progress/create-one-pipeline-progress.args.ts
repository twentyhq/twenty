import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineProgressCreateInput } from './pipeline-progress-create.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateOnePipelineProgressArgs {
  @Field(() => PipelineProgressCreateInput, { nullable: false })
  @Type(() => PipelineProgressCreateInput)
  data!: PipelineProgressCreateInput;
}
