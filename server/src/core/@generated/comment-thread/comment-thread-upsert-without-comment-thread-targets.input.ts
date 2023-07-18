import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadUpdateWithoutCommentThreadTargetsInput } from './comment-thread-update-without-comment-thread-targets.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateWithoutCommentThreadTargetsInput } from './comment-thread-create-without-comment-thread-targets.input';

@InputType()
export class CommentThreadUpsertWithoutCommentThreadTargetsInput {

    @HideField()
    update!: CommentThreadUpdateWithoutCommentThreadTargetsInput;

    @HideField()
    create!: CommentThreadCreateWithoutCommentThreadTargetsInput;
}
