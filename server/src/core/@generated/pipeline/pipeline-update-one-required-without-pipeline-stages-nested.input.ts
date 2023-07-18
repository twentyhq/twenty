import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineCreateWithoutPipelineStagesInput } from './pipeline-create-without-pipeline-stages.input';
import { HideField } from '@nestjs/graphql';
import { PipelineCreateOrConnectWithoutPipelineStagesInput } from './pipeline-create-or-connect-without-pipeline-stages.input';
import { PipelineUpsertWithoutPipelineStagesInput } from './pipeline-upsert-without-pipeline-stages.input';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineUpdateWithoutPipelineStagesInput } from './pipeline-update-without-pipeline-stages.input';

@InputType()
export class PipelineUpdateOneRequiredWithoutPipelineStagesNestedInput {

    @HideField()
    create?: PipelineCreateWithoutPipelineStagesInput;

    @HideField()
    connectOrCreate?: PipelineCreateOrConnectWithoutPipelineStagesInput;

    @HideField()
    upsert?: PipelineUpsertWithoutPipelineStagesInput;

    @Field(() => PipelineWhereUniqueInput, {nullable:true})
    @Type(() => PipelineWhereUniqueInput)
    connect?: PipelineWhereUniqueInput;

    @HideField()
    update?: PipelineUpdateWithoutPipelineStagesInput;
}
