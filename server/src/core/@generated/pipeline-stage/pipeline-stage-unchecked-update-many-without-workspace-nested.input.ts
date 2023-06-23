import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageCreateWithoutWorkspaceInput } from './pipeline-stage-create-without-workspace.input';
import { Type } from 'class-transformer';
import { PipelineStageCreateOrConnectWithoutWorkspaceInput } from './pipeline-stage-create-or-connect-without-workspace.input';
import { PipelineStageUpsertWithWhereUniqueWithoutWorkspaceInput } from './pipeline-stage-upsert-with-where-unique-without-workspace.input';
import { PipelineStageCreateManyWorkspaceInputEnvelope } from './pipeline-stage-create-many-workspace-input-envelope.input';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { PipelineStageUpdateWithWhereUniqueWithoutWorkspaceInput } from './pipeline-stage-update-with-where-unique-without-workspace.input';
import { PipelineStageUpdateManyWithWhereWithoutWorkspaceInput } from './pipeline-stage-update-many-with-where-without-workspace.input';
import { PipelineStageScalarWhereInput } from './pipeline-stage-scalar-where.input';

@InputType()
export class PipelineStageUncheckedUpdateManyWithoutWorkspaceNestedInput {

    @Field(() => [PipelineStageCreateWithoutWorkspaceInput], {nullable:true})
    @Type(() => PipelineStageCreateWithoutWorkspaceInput)
    create?: Array<PipelineStageCreateWithoutWorkspaceInput>;

    @Field(() => [PipelineStageCreateOrConnectWithoutWorkspaceInput], {nullable:true})
    @Type(() => PipelineStageCreateOrConnectWithoutWorkspaceInput)
    connectOrCreate?: Array<PipelineStageCreateOrConnectWithoutWorkspaceInput>;

    @Field(() => [PipelineStageUpsertWithWhereUniqueWithoutWorkspaceInput], {nullable:true})
    @Type(() => PipelineStageUpsertWithWhereUniqueWithoutWorkspaceInput)
    upsert?: Array<PipelineStageUpsertWithWhereUniqueWithoutWorkspaceInput>;

    @Field(() => PipelineStageCreateManyWorkspaceInputEnvelope, {nullable:true})
    @Type(() => PipelineStageCreateManyWorkspaceInputEnvelope)
    createMany?: PipelineStageCreateManyWorkspaceInputEnvelope;

    @Field(() => [PipelineStageWhereUniqueInput], {nullable:true})
    @Type(() => PipelineStageWhereUniqueInput)
    set?: Array<PipelineStageWhereUniqueInput>;

    @Field(() => [PipelineStageWhereUniqueInput], {nullable:true})
    @Type(() => PipelineStageWhereUniqueInput)
    disconnect?: Array<PipelineStageWhereUniqueInput>;

    @Field(() => [PipelineStageWhereUniqueInput], {nullable:true})
    @Type(() => PipelineStageWhereUniqueInput)
    delete?: Array<PipelineStageWhereUniqueInput>;

    @Field(() => [PipelineStageWhereUniqueInput], {nullable:true})
    @Type(() => PipelineStageWhereUniqueInput)
    connect?: Array<PipelineStageWhereUniqueInput>;

    @Field(() => [PipelineStageUpdateWithWhereUniqueWithoutWorkspaceInput], {nullable:true})
    @Type(() => PipelineStageUpdateWithWhereUniqueWithoutWorkspaceInput)
    update?: Array<PipelineStageUpdateWithWhereUniqueWithoutWorkspaceInput>;

    @Field(() => [PipelineStageUpdateManyWithWhereWithoutWorkspaceInput], {nullable:true})
    @Type(() => PipelineStageUpdateManyWithWhereWithoutWorkspaceInput)
    updateMany?: Array<PipelineStageUpdateManyWithWhereWithoutWorkspaceInput>;

    @Field(() => [PipelineStageScalarWhereInput], {nullable:true})
    @Type(() => PipelineStageScalarWhereInput)
    deleteMany?: Array<PipelineStageScalarWhereInput>;
}
