import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineAssociationCreateManyPipelineInput } from './pipeline-association-create-many-pipeline.input';
import { Type } from 'class-transformer';

@InputType()
export class PipelineAssociationCreateManyPipelineInputEnvelope {
  @Field(() => [PipelineAssociationCreateManyPipelineInput], {
    nullable: false,
  })
  @Type(() => PipelineAssociationCreateManyPipelineInput)
  data!: Array<PipelineAssociationCreateManyPipelineInput>;

  @Field(() => Boolean, { nullable: true })
  skipDuplicates?: boolean;
}
