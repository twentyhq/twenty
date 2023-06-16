import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineCreateWithoutWorkspaceInput } from './pipeline-create-without-workspace.input';
import { Type } from 'class-transformer';
import { PipelineCreateOrConnectWithoutWorkspaceInput } from './pipeline-create-or-connect-without-workspace.input';
import { PipelineCreateManyWorkspaceInputEnvelope } from './pipeline-create-many-workspace-input-envelope.input';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';

@InputType()
export class PipelineCreateNestedManyWithoutWorkspaceInput {

    @Field(() => [PipelineCreateWithoutWorkspaceInput], {nullable:true})
    @Type(() => PipelineCreateWithoutWorkspaceInput)
    create?: Array<PipelineCreateWithoutWorkspaceInput>;

    @Field(() => [PipelineCreateOrConnectWithoutWorkspaceInput], {nullable:true})
    @Type(() => PipelineCreateOrConnectWithoutWorkspaceInput)
    connectOrCreate?: Array<PipelineCreateOrConnectWithoutWorkspaceInput>;

    @Field(() => PipelineCreateManyWorkspaceInputEnvelope, {nullable:true})
    @Type(() => PipelineCreateManyWorkspaceInputEnvelope)
    createMany?: PipelineCreateManyWorkspaceInputEnvelope;

    @Field(() => [PipelineWhereUniqueInput], {nullable:true})
    @Type(() => PipelineWhereUniqueInput)
    connect?: Array<PipelineWhereUniqueInput>;
}
