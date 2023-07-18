import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutPipelinesInput } from './workspace-create-without-pipelines.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateOrConnectWithoutPipelinesInput } from './workspace-create-or-connect-without-pipelines.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class WorkspaceCreateNestedOneWithoutPipelinesInput {

    @HideField()
    create?: WorkspaceCreateWithoutPipelinesInput;

    @HideField()
    connectOrCreate?: WorkspaceCreateOrConnectWithoutPipelinesInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;
}
