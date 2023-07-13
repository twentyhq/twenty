import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { CommentThreadTargetUpdateManyWithoutCommentThreadNestedInput } from '../comment-thread-target/comment-thread-target-update-many-without-comment-thread-nested.input';
import { CommentUpdateManyWithoutCommentThreadNestedInput } from '../comment/comment-update-many-without-comment-thread-nested.input';
import { WorkspaceUpdateOneRequiredWithoutCommentThreadsNestedInput } from '../workspace/workspace-update-one-required-without-comment-threads-nested.input';

@InputType()
export class CommentThreadUpdateWithoutAuthorInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

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

    @Field(() => CommentThreadTargetUpdateManyWithoutCommentThreadNestedInput, {nullable:true})
    commentThreadTargets?: CommentThreadTargetUpdateManyWithoutCommentThreadNestedInput;

    @Field(() => CommentUpdateManyWithoutCommentThreadNestedInput, {nullable:true})
    comments?: CommentUpdateManyWithoutCommentThreadNestedInput;

    @HideField()
    workspace?: WorkspaceUpdateOneRequiredWithoutCommentThreadsNestedInput;
}
