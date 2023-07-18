import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageCreateWithoutWorkspaceInput } from './pipeline-stage-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { PipelineStageCreateOrConnectWithoutWorkspaceInput } from './pipeline-stage-create-or-connect-without-workspace.input';
import { PipelineStageUpsertWithWhereUniqueWithoutWorkspaceInput } from './pipeline-stage-upsert-with-where-unique-without-workspace.input';
import { PipelineStageCreateManyWorkspaceInputEnvelope } from './pipeline-stage-create-many-workspace-input-envelope.input';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineStageUpdateWithWhereUniqueWithoutWorkspaceInput } from './pipeline-stage-update-with-where-unique-without-workspace.input';
import { PipelineStageUpdateManyWithWhereWithoutWorkspaceInput } from './pipeline-stage-update-many-with-where-without-workspace.input';
import { PipelineStageScalarWhereInput } from './pipeline-stage-scalar-where.input';

@InputType()
export class PipelineStageUpdateManyWithoutWorkspaceNestedInput {

    @HideField()
    create?: Array<PipelineStageCreateWithoutWorkspaceInput>;

    @HideField()
    connectOrCreate?: Array<PipelineStageCreateOrConnectWithoutWorkspaceInput>;

    @HideField()
    upsert?: Array<PipelineStageUpsertWithWhereUniqueWithoutWorkspaceInput>;

    @HideField()
    createMany?: PipelineStageCreateManyWorkspaceInputEnvelope;

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
    update?: Array<PipelineStageUpdateWithWhereUniqueWithoutWorkspaceInput>;

    @HideField()
    updateMany?: Array<PipelineStageUpdateManyWithWhereWithoutWorkspaceInput>;

    @HideField()
    deleteMany?: Array<PipelineStageScalarWhereInput>;
}
