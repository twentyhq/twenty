import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutCommentsInput } from './workspace-create-without-comments.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateOrConnectWithoutCommentsInput } from './workspace-create-or-connect-without-comments.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';

@InputType()
export class WorkspaceCreateNestedOneWithoutCommentsInput {

    @Field(() => WorkspaceCreateWithoutCommentsInput, {nullable:true})
    @Type(() => WorkspaceCreateWithoutCommentsInput)
    create?: WorkspaceCreateWithoutCommentsInput;

    @Field(() => WorkspaceCreateOrConnectWithoutCommentsInput, {nullable:true})
    @Type(() => WorkspaceCreateOrConnectWithoutCommentsInput)
    connectOrCreate?: WorkspaceCreateOrConnectWithoutCommentsInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;
}
