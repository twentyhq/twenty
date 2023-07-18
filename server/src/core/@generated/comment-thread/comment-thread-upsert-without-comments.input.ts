import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadUpdateWithoutCommentsInput } from './comment-thread-update-without-comments.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateWithoutCommentsInput } from './comment-thread-create-without-comments.input';

@InputType()
export class CommentThreadUpsertWithoutCommentsInput {

    @HideField()
    update!: CommentThreadUpdateWithoutCommentsInput;

    @HideField()
    create!: CommentThreadCreateWithoutCommentsInput;
}
