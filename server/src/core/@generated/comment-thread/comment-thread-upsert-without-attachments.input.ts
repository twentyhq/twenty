import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadUpdateWithoutAttachmentsInput } from './comment-thread-update-without-attachments.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateWithoutAttachmentsInput } from './comment-thread-create-without-attachments.input';

@InputType()
export class CommentThreadUpsertWithoutAttachmentsInput {

    @HideField()
    update!: CommentThreadUpdateWithoutAttachmentsInput;

    @HideField()
    create!: CommentThreadCreateWithoutAttachmentsInput;
}
