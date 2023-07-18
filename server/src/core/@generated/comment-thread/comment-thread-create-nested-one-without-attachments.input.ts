import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutAttachmentsInput } from './comment-thread-create-without-attachments.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateOrConnectWithoutAttachmentsInput } from './comment-thread-create-or-connect-without-attachments.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class CommentThreadCreateNestedOneWithoutAttachmentsInput {

    @HideField()
    create?: CommentThreadCreateWithoutAttachmentsInput;

    @HideField()
    connectOrCreate?: CommentThreadCreateOrConnectWithoutAttachmentsInput;

    @Field(() => CommentThreadWhereUniqueInput, {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    connect?: CommentThreadWhereUniqueInput;
}
