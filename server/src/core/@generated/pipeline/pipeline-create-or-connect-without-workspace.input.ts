import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineCreateWithoutWorkspaceInput } from './pipeline-create-without-workspace.input';

@InputType()
export class PipelineCreateOrConnectWithoutWorkspaceInput {
  @Field(() => PipelineWhereUniqueInput, { nullable: false })
  @Type(() => PipelineWhereUniqueInput)
  where!: PipelineWhereUniqueInput;

  @Field(() => PipelineCreateWithoutWorkspaceInput, { nullable: false })
  @Type(() => PipelineCreateWithoutWorkspaceInput)
  create!: PipelineCreateWithoutWorkspaceInput;
}
