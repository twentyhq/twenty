import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineProgressUpdateWithoutWorkspaceInput } from './pipeline-progress-update-without-workspace.input';

@InputType()
export class PipelineProgressUpdateWithWhereUniqueWithoutWorkspaceInput {
  @Field(() => PipelineProgressWhereUniqueInput, { nullable: false })
  @Type(() => PipelineProgressWhereUniqueInput)
  where!: PipelineProgressWhereUniqueInput;

  @Field(() => PipelineProgressUpdateWithoutWorkspaceInput, { nullable: false })
  @Type(() => PipelineProgressUpdateWithoutWorkspaceInput)
  data!: PipelineProgressUpdateWithoutWorkspaceInput;
}
