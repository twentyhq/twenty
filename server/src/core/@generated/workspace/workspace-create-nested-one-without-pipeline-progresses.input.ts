import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutPipelineProgressesInput } from './workspace-create-without-pipeline-progresses.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateOrConnectWithoutPipelineProgressesInput } from './workspace-create-or-connect-without-pipeline-progresses.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';

@InputType()
export class WorkspaceCreateNestedOneWithoutPipelineProgressesInput {

    @Field(() => WorkspaceCreateWithoutPipelineProgressesInput, {nullable:true})
    @Type(() => WorkspaceCreateWithoutPipelineProgressesInput)
    create?: WorkspaceCreateWithoutPipelineProgressesInput;

    @Field(() => WorkspaceCreateOrConnectWithoutPipelineProgressesInput, {nullable:true})
    @Type(() => WorkspaceCreateOrConnectWithoutPipelineProgressesInput)
    connectOrCreate?: WorkspaceCreateOrConnectWithoutPipelineProgressesInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;
}
