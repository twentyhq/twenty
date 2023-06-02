import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineCreateWithoutPipelineAssociationsInput } from './pipeline-create-without-pipeline-associations.input';
import { Type } from 'class-transformer';
import { PipelineCreateOrConnectWithoutPipelineAssociationsInput } from './pipeline-create-or-connect-without-pipeline-associations.input';
import { PipelineUpsertWithoutPipelineAssociationsInput } from './pipeline-upsert-without-pipeline-associations.input';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';
import { PipelineUpdateWithoutPipelineAssociationsInput } from './pipeline-update-without-pipeline-associations.input';

@InputType()
export class PipelineUpdateOneRequiredWithoutPipelineAssociationsNestedInput {
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

  @Field(() => PipelineUpsertWithoutPipelineAssociationsInput, {
    nullable: true,
  })
  @Type(() => PipelineUpsertWithoutPipelineAssociationsInput)
  upsert?: PipelineUpsertWithoutPipelineAssociationsInput;

  @Field(() => PipelineWhereUniqueInput, { nullable: true })
  @Type(() => PipelineWhereUniqueInput)
  connect?: PipelineWhereUniqueInput;

  @Field(() => PipelineUpdateWithoutPipelineAssociationsInput, {
    nullable: true,
  })
  @Type(() => PipelineUpdateWithoutPipelineAssociationsInput)
  update?: PipelineUpdateWithoutPipelineAssociationsInput;
}
