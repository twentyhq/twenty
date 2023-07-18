import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { Type } from 'class-transformer';
import { AttachmentCreateWithoutCommentThreadInput } from './attachment-create-without-comment-thread.input';

@InputType()
export class AttachmentCreateOrConnectWithoutCommentThreadInput {

    @Field(() => AttachmentWhereUniqueInput, {nullable:false})
    @Type(() => AttachmentWhereUniqueInput)
    where!: AttachmentWhereUniqueInput;

    @Field(() => AttachmentCreateWithoutCommentThreadInput, {nullable:false})
    @Type(() => AttachmentCreateWithoutCommentThreadInput)
    create!: AttachmentCreateWithoutCommentThreadInput;
}
