import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineCreateInput } from './pipeline-create.input';
import { PipelineUpdateInput } from './pipeline-update.input';

@ArgsType()
export class UpsertOnePipelineArgs {
  @Field(() => PipelineWhereUniqueInput, { nullable: false })
  @Type(() => PipelineWhereUniqueInput)
  where!: PipelineWhereUniqueInput;

  @Field(() => PipelineCreateInput, { nullable: false })
  @Type(() => PipelineCreateInput)
  create!: PipelineCreateInput;

  @Field(() => PipelineUpdateInput, { nullable: false })
  @Type(() => PipelineUpdateInput)
  update!: PipelineUpdateInput;
}
