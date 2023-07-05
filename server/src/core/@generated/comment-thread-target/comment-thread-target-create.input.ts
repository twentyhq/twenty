import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { CommentableType } from '../prisma/commentable-type.enum';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateNestedOneWithoutCommentThreadTargetsInput } from '../comment-thread/comment-thread-create-nested-one-without-comment-thread-targets.input';

@InputType()
export class CommentThreadTargetCreateInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => CommentableType, {nullable:false})
    commentableType!: keyof typeof CommentableType;

    @Field(() => String, {nullable:false})
    commentableId!: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => CommentThreadCreateNestedOneWithoutCommentThreadTargetsInput, {nullable:false})
    commentThread!: CommentThreadCreateNestedOneWithoutCommentThreadTargetsInput;
}
