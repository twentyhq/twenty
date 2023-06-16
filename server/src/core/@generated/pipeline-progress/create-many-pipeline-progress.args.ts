import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineProgressCreateManyInput } from './pipeline-progress-create-many.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateManyPipelineProgressArgs {
  @Field(() => [PipelineProgressCreateManyInput], { nullable: false })
  @Type(() => PipelineProgressCreateManyInput)
  data!: Array<PipelineProgressCreateManyInput>;

  @Field(() => Boolean, { nullable: true })
  skipDuplicates?: boolean;
}
