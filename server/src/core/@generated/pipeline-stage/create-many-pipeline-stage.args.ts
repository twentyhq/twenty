import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineStageCreateManyInput } from './pipeline-stage-create-many.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateManyPipelineStageArgs {
  @Field(() => [PipelineStageCreateManyInput], { nullable: false })
  @Type(() => PipelineStageCreateManyInput)
  data!: Array<PipelineStageCreateManyInput>;

  @Field(() => Boolean, { nullable: true })
  skipDuplicates?: boolean;
}
