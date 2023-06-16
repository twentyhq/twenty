import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutPipelinesInput } from './workspace-create-without-pipelines.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateOrConnectWithoutPipelinesInput } from './workspace-create-or-connect-without-pipelines.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';

@InputType()
export class WorkspaceCreateNestedOneWithoutPipelinesInput {

    @Field(() => WorkspaceCreateWithoutPipelinesInput, {nullable:true})
    @Type(() => WorkspaceCreateWithoutPipelinesInput)
    create?: WorkspaceCreateWithoutPipelinesInput;

    @Field(() => WorkspaceCreateOrConnectWithoutPipelinesInput, {nullable:true})
    @Type(() => WorkspaceCreateOrConnectWithoutPipelinesInput)
    connectOrCreate?: WorkspaceCreateOrConnectWithoutPipelinesInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;
}
