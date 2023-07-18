import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressCreateWithoutPipelineInput } from './pipeline-progress-create-without-pipeline.input';
import { HideField } from '@nestjs/graphql';
import { PipelineProgressCreateOrConnectWithoutPipelineInput } from './pipeline-progress-create-or-connect-without-pipeline.input';
import { PipelineProgressUpsertWithWhereUniqueWithoutPipelineInput } from './pipeline-progress-upsert-with-where-unique-without-pipeline.input';
import { PipelineProgressCreateManyPipelineInputEnvelope } from './pipeline-progress-create-many-pipeline-input-envelope.input';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineProgressUpdateWithWhereUniqueWithoutPipelineInput } from './pipeline-progress-update-with-where-unique-without-pipeline.input';
import { PipelineProgressUpdateManyWithWhereWithoutPipelineInput } from './pipeline-progress-update-many-with-where-without-pipeline.input';
import { PipelineProgressScalarWhereInput } from './pipeline-progress-scalar-where.input';

@InputType()
export class PipelineProgressUpdateManyWithoutPipelineNestedInput {

    @HideField()
    create?: Array<PipelineProgressCreateWithoutPipelineInput>;

    @HideField()
    connectOrCreate?: Array<PipelineProgressCreateOrConnectWithoutPipelineInput>;

    @HideField()
    upsert?: Array<PipelineProgressUpsertWithWhereUniqueWithoutPipelineInput>;

    @HideField()
    createMany?: PipelineProgressCreateManyPipelineInputEnvelope;

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
    update?: Array<PipelineProgressUpdateWithWhereUniqueWithoutPipelineInput>;

    @HideField()
    updateMany?: Array<PipelineProgressUpdateManyWithWhereWithoutPipelineInput>;

    @HideField()
    deleteMany?: Array<PipelineProgressScalarWhereInput>;
}
