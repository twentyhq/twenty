import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutCommentThreadsInput } from './workspace-create-without-comment-threads.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateOrConnectWithoutCommentThreadsInput } from './workspace-create-or-connect-without-comment-threads.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';

@InputType()
export class WorkspaceCreateNestedOneWithoutCommentThreadsInput {

    @Field(() => WorkspaceCreateWithoutCommentThreadsInput, {nullable:true})
    @Type(() => WorkspaceCreateWithoutCommentThreadsInput)
    create?: WorkspaceCreateWithoutCommentThreadsInput;

    @Field(() => WorkspaceCreateOrConnectWithoutCommentThreadsInput, {nullable:true})
    @Type(() => WorkspaceCreateOrConnectWithoutCommentThreadsInput)
    connectOrCreate?: WorkspaceCreateOrConnectWithoutCommentThreadsInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;
}
