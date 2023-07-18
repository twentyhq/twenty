import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadUpdateWithoutAttachmentsInput } from './comment-thread-update-without-attachments.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateWithoutAttachmentsInput } from './comment-thread-create-without-attachments.input';

@InputType()
export class CommentThreadUpsertWithoutAttachmentsInput {

    @Field(() => CommentThreadUpdateWithoutAttachmentsInput, {nullable:false})
    @Type(() => CommentThreadUpdateWithoutAttachmentsInput)
    update!: CommentThreadUpdateWithoutAttachmentsInput;

    @Field(() => CommentThreadCreateWithoutAttachmentsInput, {nullable:false})
    @Type(() => CommentThreadCreateWithoutAttachmentsInput)
    create!: CommentThreadCreateWithoutAttachmentsInput;
}
