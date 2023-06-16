import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutPipelineStagesInput } from './workspace-create-without-pipeline-stages.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateOrConnectWithoutPipelineStagesInput } from './workspace-create-or-connect-without-pipeline-stages.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';

@InputType()
export class WorkspaceCreateNestedOneWithoutPipelineStagesInput {

    @Field(() => WorkspaceCreateWithoutPipelineStagesInput, {nullable:true})
    @Type(() => WorkspaceCreateWithoutPipelineStagesInput)
    create?: WorkspaceCreateWithoutPipelineStagesInput;

    @Field(() => WorkspaceCreateOrConnectWithoutPipelineStagesInput, {nullable:true})
    @Type(() => WorkspaceCreateOrConnectWithoutPipelineStagesInput)
    connectOrCreate?: WorkspaceCreateOrConnectWithoutPipelineStagesInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;
}
