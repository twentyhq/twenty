import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineCreateWithoutWorkspaceInput } from './pipeline-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { PipelineCreateOrConnectWithoutWorkspaceInput } from './pipeline-create-or-connect-without-workspace.input';
import { PipelineCreateManyWorkspaceInputEnvelope } from './pipeline-create-many-workspace-input-envelope.input';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class PipelineCreateNestedManyWithoutWorkspaceInput {

    @HideField()
    create?: Array<PipelineCreateWithoutWorkspaceInput>;

    @HideField()
    connectOrCreate?: Array<PipelineCreateOrConnectWithoutWorkspaceInput>;

    @HideField()
    createMany?: PipelineCreateManyWorkspaceInputEnvelope;

    @Field(() => [PipelineWhereUniqueInput], {nullable:true})
    @Type(() => PipelineWhereUniqueInput)
    connect?: Array<PipelineWhereUniqueInput>;
}
