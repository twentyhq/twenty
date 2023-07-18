import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutCommentThreadsInput } from './workspace-create-without-comment-threads.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateOrConnectWithoutCommentThreadsInput } from './workspace-create-or-connect-without-comment-threads.input';
import { WorkspaceUpsertWithoutCommentThreadsInput } from './workspace-upsert-without-comment-threads.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceUpdateWithoutCommentThreadsInput } from './workspace-update-without-comment-threads.input';

@InputType()
export class WorkspaceUpdateOneRequiredWithoutCommentThreadsNestedInput {

    @HideField()
    create?: WorkspaceCreateWithoutCommentThreadsInput;

    @HideField()
    connectOrCreate?: WorkspaceCreateOrConnectWithoutCommentThreadsInput;

    @HideField()
    upsert?: WorkspaceUpsertWithoutCommentThreadsInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;

    @HideField()
    update?: WorkspaceUpdateWithoutCommentThreadsInput;
}
