import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineCreateWithoutPipelineProgressesInput } from './pipeline-create-without-pipeline-progresses.input';
import { Type } from 'class-transformer';
import { PipelineCreateOrConnectWithoutPipelineProgressesInput } from './pipeline-create-or-connect-without-pipeline-progresses.input';
import { PipelineUpsertWithoutPipelineProgressesInput } from './pipeline-upsert-without-pipeline-progresses.input';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';
import { PipelineUpdateWithoutPipelineProgressesInput } from './pipeline-update-without-pipeline-progresses.input';

@InputType()
export class PipelineUpdateOneRequiredWithoutPipelineProgressesNestedInput {

    @Field(() => PipelineCreateWithoutPipelineProgressesInput, {nullable:true})
    @Type(() => PipelineCreateWithoutPipelineProgressesInput)
    create?: PipelineCreateWithoutPipelineProgressesInput;

    @Field(() => PipelineCreateOrConnectWithoutPipelineProgressesInput, {nullable:true})
    @Type(() => PipelineCreateOrConnectWithoutPipelineProgressesInput)
    connectOrCreate?: PipelineCreateOrConnectWithoutPipelineProgressesInput;

    @Field(() => PipelineUpsertWithoutPipelineProgressesInput, {nullable:true})
    @Type(() => PipelineUpsertWithoutPipelineProgressesInput)
    upsert?: PipelineUpsertWithoutPipelineProgressesInput;

    @Field(() => PipelineWhereUniqueInput, {nullable:true})
    @Type(() => PipelineWhereUniqueInput)
    connect?: PipelineWhereUniqueInput;

    @Field(() => PipelineUpdateWithoutPipelineProgressesInput, {nullable:true})
    @Type(() => PipelineUpdateWithoutPipelineProgressesInput)
    update?: PipelineUpdateWithoutPipelineProgressesInput;
}
