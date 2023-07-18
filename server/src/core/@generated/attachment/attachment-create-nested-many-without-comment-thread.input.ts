import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentCreateWithoutCommentThreadInput } from './attachment-create-without-comment-thread.input';
import { Type } from 'class-transformer';
import { AttachmentCreateOrConnectWithoutCommentThreadInput } from './attachment-create-or-connect-without-comment-thread.input';
import { AttachmentCreateManyCommentThreadInputEnvelope } from './attachment-create-many-comment-thread-input-envelope.input';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';

@InputType()
export class AttachmentCreateNestedManyWithoutCommentThreadInput {

    @Field(() => [AttachmentCreateWithoutCommentThreadInput], {nullable:true})
    @Type(() => AttachmentCreateWithoutCommentThreadInput)
    create?: Array<AttachmentCreateWithoutCommentThreadInput>;

    @Field(() => [AttachmentCreateOrConnectWithoutCommentThreadInput], {nullable:true})
    @Type(() => AttachmentCreateOrConnectWithoutCommentThreadInput)
    connectOrCreate?: Array<AttachmentCreateOrConnectWithoutCommentThreadInput>;

    @Field(() => AttachmentCreateManyCommentThreadInputEnvelope, {nullable:true})
    @Type(() => AttachmentCreateManyCommentThreadInputEnvelope)
    createMany?: AttachmentCreateManyCommentThreadInputEnvelope;

    @Field(() => [AttachmentWhereUniqueInput], {nullable:true})
    @Type(() => AttachmentWhereUniqueInput)
    connect?: Array<AttachmentWhereUniqueInput>;
}
