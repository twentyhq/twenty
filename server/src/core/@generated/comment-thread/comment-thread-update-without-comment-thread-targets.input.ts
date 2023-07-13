import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { CommentUpdateManyWithoutCommentThreadNestedInput } from '../comment/comment-update-many-without-comment-thread-nested.input';
import { WorkspaceUpdateOneRequiredWithoutCommentThreadsNestedInput } from '../workspace/workspace-update-one-required-without-comment-threads-nested.input';
import { UserUpdateOneRequiredWithoutCommentThreadNestedInput } from '../user/user-update-one-required-without-comment-thread-nested.input';

@InputType()
export class CommentThreadUpdateWithoutCommentThreadTargetsInput {

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

    @Field(() => CommentUpdateManyWithoutCommentThreadNestedInput, {nullable:true})
    comments?: CommentUpdateManyWithoutCommentThreadNestedInput;

    @HideField()
    workspace?: WorkspaceUpdateOneRequiredWithoutCommentThreadsNestedInput;

    @Field(() => UserUpdateOneRequiredWithoutCommentThreadNestedInput, {nullable:true})
    author?: UserUpdateOneRequiredWithoutCommentThreadNestedInput;
}
