import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineCreateManyWorkspaceInput } from './pipeline-create-many-workspace.input';
import { Type } from 'class-transformer';

@InputType()
export class PipelineCreateManyWorkspaceInputEnvelope {
  @Field(() => [PipelineCreateManyWorkspaceInput], { nullable: false })
  @Type(() => PipelineCreateManyWorkspaceInput)
  data!: Array<PipelineCreateManyWorkspaceInput>;

  @Field(() => Boolean, { nullable: true })
  skipDuplicates?: boolean;
}
