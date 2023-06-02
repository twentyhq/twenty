import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageCreateManyWorkspaceInput } from './pipeline-stage-create-many-workspace.input';
import { Type } from 'class-transformer';

@InputType()
export class PipelineStageCreateManyWorkspaceInputEnvelope {
  @Field(() => [PipelineStageCreateManyWorkspaceInput], { nullable: false })
  @Type(() => PipelineStageCreateManyWorkspaceInput)
  data!: Array<PipelineStageCreateManyWorkspaceInput>;

  @Field(() => Boolean, { nullable: true })
  skipDuplicates?: boolean;
}
