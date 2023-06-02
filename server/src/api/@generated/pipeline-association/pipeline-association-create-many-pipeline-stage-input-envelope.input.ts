import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineAssociationCreateManyPipelineStageInput } from './pipeline-association-create-many-pipeline-stage.input';
import { Type } from 'class-transformer';

@InputType()
export class PipelineAssociationCreateManyPipelineStageInputEnvelope {
  @Field(() => [PipelineAssociationCreateManyPipelineStageInput], {
    nullable: false,
  })
  @Type(() => PipelineAssociationCreateManyPipelineStageInput)
  data!: Array<PipelineAssociationCreateManyPipelineStageInput>;

  @Field(() => Boolean, { nullable: true })
  skipDuplicates?: boolean;
}
