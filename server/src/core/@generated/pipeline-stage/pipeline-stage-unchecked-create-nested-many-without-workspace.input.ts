import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageCreateWithoutWorkspaceInput } from './pipeline-stage-create-without-workspace.input';
import { Type } from 'class-transformer';
import { PipelineStageCreateOrConnectWithoutWorkspaceInput } from './pipeline-stage-create-or-connect-without-workspace.input';
import { PipelineStageCreateManyWorkspaceInputEnvelope } from './pipeline-stage-create-many-workspace-input-envelope.input';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';

@InputType()
export class PipelineStageUncheckedCreateNestedManyWithoutWorkspaceInput {

    @Field(() => [PipelineStageCreateWithoutWorkspaceInput], {nullable:true})
    @Type(() => PipelineStageCreateWithoutWorkspaceInput)
    create?: Array<PipelineStageCreateWithoutWorkspaceInput>;

    @Field(() => [PipelineStageCreateOrConnectWithoutWorkspaceInput], {nullable:true})
    @Type(() => PipelineStageCreateOrConnectWithoutWorkspaceInput)
    connectOrCreate?: Array<PipelineStageCreateOrConnectWithoutWorkspaceInput>;

    @Field(() => PipelineStageCreateManyWorkspaceInputEnvelope, {nullable:true})
    @Type(() => PipelineStageCreateManyWorkspaceInputEnvelope)
    createMany?: PipelineStageCreateManyWorkspaceInputEnvelope;

    @Field(() => [PipelineStageWhereUniqueInput], {nullable:true})
    @Type(() => PipelineStageWhereUniqueInput)
    connect?: Array<PipelineStageWhereUniqueInput>;
}
