import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { UserUpdateOneRequiredWithoutCommentsNestedInput } from '../user/user-update-one-required-without-comments-nested.input';
import { CommentThreadUpdateOneRequiredWithoutCommentsNestedInput } from '../comment-thread/comment-thread-update-one-required-without-comments-nested.input';

@InputType()
export class CommentUpdateWithoutWorkspaceInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    body?: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => UserUpdateOneRequiredWithoutCommentsNestedInput, {nullable:true})
    author?: UserUpdateOneRequiredWithoutCommentsNestedInput;

    @Field(() => CommentThreadUpdateOneRequiredWithoutCommentsNestedInput, {nullable:true})
    commentThread?: CommentThreadUpdateOneRequiredWithoutCommentsNestedInput;
}
