import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineAssociationCreateWithoutPipelineInput } from './pipeline-association-create-without-pipeline.input';
import { Type } from 'class-transformer';
import { PipelineAssociationCreateOrConnectWithoutPipelineInput } from './pipeline-association-create-or-connect-without-pipeline.input';
import { PipelineAssociationCreateManyPipelineInputEnvelope } from './pipeline-association-create-many-pipeline-input-envelope.input';
import { PipelineAssociationWhereUniqueInput } from './pipeline-association-where-unique.input';

@InputType()
export class PipelineAssociationCreateNestedManyWithoutPipelineInput {
  @Field(() => [PipelineAssociationCreateWithoutPipelineInput], {
    nullable: true,
  })
  @Type(() => PipelineAssociationCreateWithoutPipelineInput)
  create?: Array<PipelineAssociationCreateWithoutPipelineInput>;

  @Field(() => [PipelineAssociationCreateOrConnectWithoutPipelineInput], {
    nullable: true,
  })
  @Type(() => PipelineAssociationCreateOrConnectWithoutPipelineInput)
  connectOrCreate?: Array<PipelineAssociationCreateOrConnectWithoutPipelineInput>;

  @Field(() => PipelineAssociationCreateManyPipelineInputEnvelope, {
    nullable: true,
  })
  @Type(() => PipelineAssociationCreateManyPipelineInputEnvelope)
  createMany?: PipelineAssociationCreateManyPipelineInputEnvelope;

  @Field(() => [PipelineAssociationWhereUniqueInput], { nullable: true })
  @Type(() => PipelineAssociationWhereUniqueInput)
  connect?: Array<PipelineAssociationWhereUniqueInput>;
}
