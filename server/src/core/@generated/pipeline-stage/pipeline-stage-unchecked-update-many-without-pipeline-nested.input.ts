import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageCreateWithoutPipelineInput } from './pipeline-stage-create-without-pipeline.input';
import { HideField } from '@nestjs/graphql';
import { PipelineStageCreateOrConnectWithoutPipelineInput } from './pipeline-stage-create-or-connect-without-pipeline.input';
import { PipelineStageUpsertWithWhereUniqueWithoutPipelineInput } from './pipeline-stage-upsert-with-where-unique-without-pipeline.input';
import { PipelineStageCreateManyPipelineInputEnvelope } from './pipeline-stage-create-many-pipeline-input-envelope.input';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineStageUpdateWithWhereUniqueWithoutPipelineInput } from './pipeline-stage-update-with-where-unique-without-pipeline.input';
import { PipelineStageUpdateManyWithWhereWithoutPipelineInput } from './pipeline-stage-update-many-with-where-without-pipeline.input';
import { PipelineStageScalarWhereInput } from './pipeline-stage-scalar-where.input';

@InputType()
export class PipelineStageUncheckedUpdateManyWithoutPipelineNestedInput {

    @HideField()
    create?: Array<PipelineStageCreateWithoutPipelineInput>;

    @HideField()
    connectOrCreate?: Array<PipelineStageCreateOrConnectWithoutPipelineInput>;

    @HideField()
    upsert?: Array<PipelineStageUpsertWithWhereUniqueWithoutPipelineInput>;

    @HideField()
    createMany?: PipelineStageCreateManyPipelineInputEnvelope;

    @Field(() => [PipelineStageWhereUniqueInput], {nullable:true})
    @Type(() => PipelineStageWhereUniqueInput)
    set?: Array<PipelineStageWhereUniqueInput>;

    @Field(() => [PipelineStageWhereUniqueInput], {nullable:true})
    @Type(() => PipelineStageWhereUniqueInput)
    disconnect?: Array<PipelineStageWhereUniqueInput>;

    @HideField()
    delete?: Array<PipelineStageWhereUniqueInput>;

    @Field(() => [PipelineStageWhereUniqueInput], {nullable:true})
    @Type(() => PipelineStageWhereUniqueInput)
    connect?: Array<PipelineStageWhereUniqueInput>;

    @HideField()
    update?: Array<PipelineStageUpdateWithWhereUniqueWithoutPipelineInput>;

    @HideField()
    updateMany?: Array<PipelineStageUpdateManyWithWhereWithoutPipelineInput>;

    @HideField()
    deleteMany?: Array<PipelineStageScalarWhereInput>;
}
