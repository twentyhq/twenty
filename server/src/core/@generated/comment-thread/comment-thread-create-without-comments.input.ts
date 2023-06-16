import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadTargetCreateNestedManyWithoutCommentThreadInput } from '../comment-thread-target/comment-thread-target-create-nested-many-without-comment-thread.input';
import { WorkspaceCreateNestedOneWithoutCommentThreadsInput } from '../workspace/workspace-create-nested-one-without-comment-threads.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class CommentThreadCreateWithoutCommentsInput {

    @Field(() => String, {nullable:false})
    id!: string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    deletedAt?: Date | string;

    @Field(() => CommentThreadTargetCreateNestedManyWithoutCommentThreadInput, {nullable:true})
    commentThreadTargets?: CommentThreadTargetCreateNestedManyWithoutCommentThreadInput;

    @HideField()
    workspace!: WorkspaceCreateNestedOneWithoutCommentThreadsInput;
}
