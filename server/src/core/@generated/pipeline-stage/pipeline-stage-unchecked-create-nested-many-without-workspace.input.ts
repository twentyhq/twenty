import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageCreateWithoutWorkspaceInput } from './pipeline-stage-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { PipelineStageCreateOrConnectWithoutWorkspaceInput } from './pipeline-stage-create-or-connect-without-workspace.input';
import { PipelineStageCreateManyWorkspaceInputEnvelope } from './pipeline-stage-create-many-workspace-input-envelope.input';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class PipelineStageUncheckedCreateNestedManyWithoutWorkspaceInput {

    @HideField()
    create?: Array<PipelineStageCreateWithoutWorkspaceInput>;

    @HideField()
    connectOrCreate?: Array<PipelineStageCreateOrConnectWithoutWorkspaceInput>;

    @HideField()
    createMany?: PipelineStageCreateManyWorkspaceInputEnvelope;

    @Field(() => [PipelineStageWhereUniqueInput], {nullable:true})
    @Type(() => PipelineStageWhereUniqueInput)
    connect?: Array<PipelineStageWhereUniqueInput>;
}
