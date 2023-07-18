import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutPipelineProgressesInput } from './workspace-create-without-pipeline-progresses.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateOrConnectWithoutPipelineProgressesInput } from './workspace-create-or-connect-without-pipeline-progresses.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class WorkspaceCreateNestedOneWithoutPipelineProgressesInput {

    @HideField()
    create?: WorkspaceCreateWithoutPipelineProgressesInput;

    @HideField()
    connectOrCreate?: WorkspaceCreateOrConnectWithoutPipelineProgressesInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;
}
