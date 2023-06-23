import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineCreateWithoutPipelineStagesInput } from './pipeline-create-without-pipeline-stages.input';
import { Type } from 'class-transformer';
import { PipelineCreateOrConnectWithoutPipelineStagesInput } from './pipeline-create-or-connect-without-pipeline-stages.input';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';

@InputType()
export class PipelineCreateNestedOneWithoutPipelineStagesInput {

    @Field(() => PipelineCreateWithoutPipelineStagesInput, {nullable:true})
    @Type(() => PipelineCreateWithoutPipelineStagesInput)
    create?: PipelineCreateWithoutPipelineStagesInput;

    @Field(() => PipelineCreateOrConnectWithoutPipelineStagesInput, {nullable:true})
    @Type(() => PipelineCreateOrConnectWithoutPipelineStagesInput)
    connectOrCreate?: PipelineCreateOrConnectWithoutPipelineStagesInput;

    @Field(() => PipelineWhereUniqueInput, {nullable:true})
    @Type(() => PipelineWhereUniqueInput)
    connect?: PipelineWhereUniqueInput;
}
