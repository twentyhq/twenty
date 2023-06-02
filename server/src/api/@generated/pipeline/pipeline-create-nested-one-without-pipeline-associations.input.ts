import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineCreateWithoutPipelineAssociationsInput } from './pipeline-create-without-pipeline-associations.input';
import { Type } from 'class-transformer';
import { PipelineCreateOrConnectWithoutPipelineAssociationsInput } from './pipeline-create-or-connect-without-pipeline-associations.input';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';

@InputType()
export class PipelineCreateNestedOneWithoutPipelineAssociationsInput {
  @Field(() => PipelineCreateWithoutPipelineAssociationsInput, {
    nullable: true,
  })
  @Type(() => PipelineCreateWithoutPipelineAssociationsInput)
  create?: PipelineCreateWithoutPipelineAssociationsInput;

  @Field(() => PipelineCreateOrConnectWithoutPipelineAssociationsInput, {
    nullable: true,
  })
  @Type(() => PipelineCreateOrConnectWithoutPipelineAssociationsInput)
  connectOrCreate?: PipelineCreateOrConnectWithoutPipelineAssociationsInput;

  @Field(() => PipelineWhereUniqueInput, { nullable: true })
  @Type(() => PipelineWhereUniqueInput)
  connect?: PipelineWhereUniqueInput;
}
