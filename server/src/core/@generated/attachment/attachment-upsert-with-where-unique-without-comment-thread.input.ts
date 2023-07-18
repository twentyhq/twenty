import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { Type } from 'class-transformer';
import { AttachmentUpdateWithoutCommentThreadInput } from './attachment-update-without-comment-thread.input';
import { AttachmentCreateWithoutCommentThreadInput } from './attachment-create-without-comment-thread.input';

@InputType()
export class AttachmentUpsertWithWhereUniqueWithoutCommentThreadInput {

    @Field(() => AttachmentWhereUniqueInput, {nullable:false})
    @Type(() => AttachmentWhereUniqueInput)
    where!: AttachmentWhereUniqueInput;

    @Field(() => AttachmentUpdateWithoutCommentThreadInput, {nullable:false})
    @Type(() => AttachmentUpdateWithoutCommentThreadInput)
    update!: AttachmentUpdateWithoutCommentThreadInput;

    @Field(() => AttachmentCreateWithoutCommentThreadInput, {nullable:false})
    @Type(() => AttachmentCreateWithoutCommentThreadInput)
    create!: AttachmentCreateWithoutCommentThreadInput;
}
