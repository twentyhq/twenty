import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadUpdateWithoutCommentThreadTargetsInput } from './comment-thread-update-without-comment-thread-targets.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateWithoutCommentThreadTargetsInput } from './comment-thread-create-without-comment-thread-targets.input';

@InputType()
export class CommentThreadUpsertWithoutCommentThreadTargetsInput {

    @Field(() => CommentThreadUpdateWithoutCommentThreadTargetsInput, {nullable:false})
    @Type(() => CommentThreadUpdateWithoutCommentThreadTargetsInput)
    update!: CommentThreadUpdateWithoutCommentThreadTargetsInput;

    @Field(() => CommentThreadCreateWithoutCommentThreadTargetsInput, {nullable:false})
    @Type(() => CommentThreadCreateWithoutCommentThreadTargetsInput)
    create!: CommentThreadCreateWithoutCommentThreadTargetsInput;
}
