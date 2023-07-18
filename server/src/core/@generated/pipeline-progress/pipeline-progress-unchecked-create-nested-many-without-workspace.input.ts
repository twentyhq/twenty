import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressCreateWithoutWorkspaceInput } from './pipeline-progress-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { PipelineProgressCreateOrConnectWithoutWorkspaceInput } from './pipeline-progress-create-or-connect-without-workspace.input';
import { PipelineProgressCreateManyWorkspaceInputEnvelope } from './pipeline-progress-create-many-workspace-input-envelope.input';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class PipelineProgressUncheckedCreateNestedManyWithoutWorkspaceInput {

    @HideField()
    create?: Array<PipelineProgressCreateWithoutWorkspaceInput>;

    @HideField()
    connectOrCreate?: Array<PipelineProgressCreateOrConnectWithoutWorkspaceInput>;

    @HideField()
    createMany?: PipelineProgressCreateManyWorkspaceInputEnvelope;

    @Field(() => [PipelineProgressWhereUniqueInput], {nullable:true})
    @Type(() => PipelineProgressWhereUniqueInput)
    connect?: Array<PipelineProgressWhereUniqueInput>;
}
