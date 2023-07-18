import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutPipelineStagesInput } from './workspace-create-without-pipeline-stages.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateOrConnectWithoutPipelineStagesInput } from './workspace-create-or-connect-without-pipeline-stages.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class WorkspaceCreateNestedOneWithoutPipelineStagesInput {

    @HideField()
    create?: WorkspaceCreateWithoutPipelineStagesInput;

    @HideField()
    connectOrCreate?: WorkspaceCreateOrConnectWithoutPipelineStagesInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;
}
