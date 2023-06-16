import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineCreateWithoutPipelineProgressesInput } from './pipeline-create-without-pipeline-progresses.input';
import { HideField } from '@nestjs/graphql';
import { PipelineCreateOrConnectWithoutPipelineProgressesInput } from './pipeline-create-or-connect-without-pipeline-progresses.input';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class PipelineCreateNestedOneWithoutPipelineProgressesInput {

    @HideField()
    create?: PipelineCreateWithoutPipelineProgressesInput;

    @HideField()
    connectOrCreate?: PipelineCreateOrConnectWithoutPipelineProgressesInput;

    @Field(() => PipelineWhereUniqueInput, {nullable:true})
    @Type(() => PipelineWhereUniqueInput)
    connect?: PipelineWhereUniqueInput;
}
