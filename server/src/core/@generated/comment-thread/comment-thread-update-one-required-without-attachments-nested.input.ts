import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutAttachmentsInput } from './comment-thread-create-without-attachments.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateOrConnectWithoutAttachmentsInput } from './comment-thread-create-or-connect-without-attachments.input';
import { CommentThreadUpsertWithoutAttachmentsInput } from './comment-thread-upsert-without-attachments.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadUpdateWithoutAttachmentsInput } from './comment-thread-update-without-attachments.input';

@InputType()
export class CommentThreadUpdateOneRequiredWithoutAttachmentsNestedInput {

    @HideField()
    create?: CommentThreadCreateWithoutAttachmentsInput;

    @HideField()
    connectOrCreate?: CommentThreadCreateOrConnectWithoutAttachmentsInput;

    @HideField()
    upsert?: CommentThreadUpsertWithoutAttachmentsInput;

    @Field(() => CommentThreadWhereUniqueInput, {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    connect?: CommentThreadWhereUniqueInput;

    @HideField()
    update?: CommentThreadUpdateWithoutAttachmentsInput;
}
