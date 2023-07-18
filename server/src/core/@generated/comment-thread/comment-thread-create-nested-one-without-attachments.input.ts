import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutAttachmentsInput } from './comment-thread-create-without-attachments.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateOrConnectWithoutAttachmentsInput } from './comment-thread-create-or-connect-without-attachments.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';

@InputType()
export class CommentThreadCreateNestedOneWithoutAttachmentsInput {

    @Field(() => CommentThreadCreateWithoutAttachmentsInput, {nullable:true})
    @Type(() => CommentThreadCreateWithoutAttachmentsInput)
    create?: CommentThreadCreateWithoutAttachmentsInput;

    @Field(() => CommentThreadCreateOrConnectWithoutAttachmentsInput, {nullable:true})
    @Type(() => CommentThreadCreateOrConnectWithoutAttachmentsInput)
    connectOrCreate?: CommentThreadCreateOrConnectWithoutAttachmentsInput;

    @Field(() => CommentThreadWhereUniqueInput, {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    connect?: CommentThreadWhereUniqueInput;
}
