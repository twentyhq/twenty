import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressCreateWithoutPipelineStageInput } from './pipeline-progress-create-without-pipeline-stage.input';
import { HideField } from '@nestjs/graphql';
import { PipelineProgressCreateOrConnectWithoutPipelineStageInput } from './pipeline-progress-create-or-connect-without-pipeline-stage.input';
import { PipelineProgressUpsertWithWhereUniqueWithoutPipelineStageInput } from './pipeline-progress-upsert-with-where-unique-without-pipeline-stage.input';
import { PipelineProgressCreateManyPipelineStageInputEnvelope } from './pipeline-progress-create-many-pipeline-stage-input-envelope.input';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineProgressUpdateWithWhereUniqueWithoutPipelineStageInput } from './pipeline-progress-update-with-where-unique-without-pipeline-stage.input';
import { PipelineProgressUpdateManyWithWhereWithoutPipelineStageInput } from './pipeline-progress-update-many-with-where-without-pipeline-stage.input';
import { PipelineProgressScalarWhereInput } from './pipeline-progress-scalar-where.input';

@InputType()
export class PipelineProgressUpdateManyWithoutPipelineStageNestedInput {

    @HideField()
    create?: Array<PipelineProgressCreateWithoutPipelineStageInput>;

    @HideField()
    connectOrCreate?: Array<PipelineProgressCreateOrConnectWithoutPipelineStageInput>;

    @HideField()
    upsert?: Array<PipelineProgressUpsertWithWhereUniqueWithoutPipelineStageInput>;

    @HideField()
    createMany?: PipelineProgressCreateManyPipelineStageInputEnvelope;

    @Field(() => [PipelineProgressWhereUniqueInput], {nullable:true})
    @Type(() => PipelineProgressWhereUniqueInput)
    set?: Array<PipelineProgressWhereUniqueInput>;

    @Field(() => [PipelineProgressWhereUniqueInput], {nullable:true})
    @Type(() => PipelineProgressWhereUniqueInput)
    disconnect?: Array<PipelineProgressWhereUniqueInput>;

    @HideField()
    delete?: Array<PipelineProgressWhereUniqueInput>;

    @Field(() => [PipelineProgressWhereUniqueInput], {nullable:true})
    @Type(() => PipelineProgressWhereUniqueInput)
    connect?: Array<PipelineProgressWhereUniqueInput>;

    @HideField()
    update?: Array<PipelineProgressUpdateWithWhereUniqueWithoutPipelineStageInput>;

    @HideField()
    updateMany?: Array<PipelineProgressUpdateManyWithWhereWithoutPipelineStageInput>;

    @HideField()
    deleteMany?: Array<PipelineProgressScalarWhereInput>;
}
