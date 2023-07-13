import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { CommentThreadTargetUncheckedUpdateManyWithoutCommentThreadNestedInput } from '../comment-thread-target/comment-thread-target-unchecked-update-many-without-comment-thread-nested.input';
import { CommentUncheckedUpdateManyWithoutCommentThreadNestedInput } from '../comment/comment-unchecked-update-many-without-comment-thread-nested.input';

@InputType()
export class CommentThreadUncheckedUpdateWithoutAuthorInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @HideField()
    workspaceId?: string;

    @Field(() => String, {nullable:true})
    body?: string;

    @Field(() => String, {nullable:true})
    title?: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => CommentThreadTargetUncheckedUpdateManyWithoutCommentThreadNestedInput, {nullable:true})
    commentThreadTargets?: CommentThreadTargetUncheckedUpdateManyWithoutCommentThreadNestedInput;

    @Field(() => CommentUncheckedUpdateManyWithoutCommentThreadNestedInput, {nullable:true})
    comments?: CommentUncheckedUpdateManyWithoutCommentThreadNestedInput;
}
