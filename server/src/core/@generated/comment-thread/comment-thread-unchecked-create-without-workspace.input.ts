import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { CommentThreadTargetUncheckedCreateNestedManyWithoutCommentThreadInput } from '../comment-thread-target/comment-thread-target-unchecked-create-nested-many-without-comment-thread.input';
import { CommentUncheckedCreateNestedManyWithoutCommentThreadInput } from '../comment/comment-unchecked-create-nested-many-without-comment-thread.input';

@InputType()
export class CommentThreadUncheckedCreateWithoutWorkspaceInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:false})
    authorId!: string;

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

    @Field(() => CommentThreadTargetUncheckedCreateNestedManyWithoutCommentThreadInput, {nullable:true})
    commentThreadTargets?: CommentThreadTargetUncheckedCreateNestedManyWithoutCommentThreadInput;

    @Field(() => CommentUncheckedCreateNestedManyWithoutCommentThreadInput, {nullable:true})
    comments?: CommentUncheckedCreateNestedManyWithoutCommentThreadInput;
}
