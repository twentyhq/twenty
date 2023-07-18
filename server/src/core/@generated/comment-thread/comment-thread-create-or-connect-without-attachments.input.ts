import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateWithoutAttachmentsInput } from './comment-thread-create-without-attachments.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class CommentThreadCreateOrConnectWithoutAttachmentsInput {

    @Field(() => CommentThreadWhereUniqueInput, {nullable:false})
    @Type(() => CommentThreadWhereUniqueInput)
    where!: CommentThreadWhereUniqueInput;

    @HideField()
    create!: CommentThreadCreateWithoutAttachmentsInput;
}
