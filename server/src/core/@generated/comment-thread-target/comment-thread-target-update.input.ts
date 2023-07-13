import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { CommentableType } from '../prisma/commentable-type.enum';
import { HideField } from '@nestjs/graphql';
import { CommentThreadUpdateOneRequiredWithoutCommentThreadTargetsNestedInput } from '../comment-thread/comment-thread-update-one-required-without-comment-thread-targets-nested.input';

@InputType()
export class CommentThreadTargetUpdateInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => CommentableType, {nullable:true})
    commentableType?: keyof typeof CommentableType;

    @Field(() => String, {nullable:true})
    commentableId?: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => CommentThreadUpdateOneRequiredWithoutCommentThreadTargetsNestedInput, {nullable:true})
    commentThread?: CommentThreadUpdateOneRequiredWithoutCommentThreadTargetsNestedInput;
}
