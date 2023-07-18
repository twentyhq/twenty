import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutAttachmentsInput } from './comment-thread-create-without-attachments.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateOrConnectWithoutAttachmentsInput } from './comment-thread-create-or-connect-without-attachments.input';
import { CommentThreadUpsertWithoutAttachmentsInput } from './comment-thread-upsert-without-attachments.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { CommentThreadUpdateWithoutAttachmentsInput } from './comment-thread-update-without-attachments.input';

@InputType()
export class CommentThreadUpdateOneRequiredWithoutAttachmentsNestedInput {

    @Field(() => CommentThreadCreateWithoutAttachmentsInput, {nullable:true})
    @Type(() => CommentThreadCreateWithoutAttachmentsInput)
    create?: CommentThreadCreateWithoutAttachmentsInput;

    @Field(() => CommentThreadCreateOrConnectWithoutAttachmentsInput, {nullable:true})
    @Type(() => CommentThreadCreateOrConnectWithoutAttachmentsInput)
    connectOrCreate?: CommentThreadCreateOrConnectWithoutAttachmentsInput;

    @Field(() => CommentThreadUpsertWithoutAttachmentsInput, {nullable:true})
    @Type(() => CommentThreadUpsertWithoutAttachmentsInput)
    upsert?: CommentThreadUpsertWithoutAttachmentsInput;

    @Field(() => CommentThreadWhereUniqueInput, {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    connect?: CommentThreadWhereUniqueInput;

    @Field(() => CommentThreadUpdateWithoutAttachmentsInput, {nullable:true})
    @Type(() => CommentThreadUpdateWithoutAttachmentsInput)
    update?: CommentThreadUpdateWithoutAttachmentsInput;
}
