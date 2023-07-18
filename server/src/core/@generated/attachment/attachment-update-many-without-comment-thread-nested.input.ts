import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentCreateWithoutCommentThreadInput } from './attachment-create-without-comment-thread.input';
import { Type } from 'class-transformer';
import { AttachmentCreateOrConnectWithoutCommentThreadInput } from './attachment-create-or-connect-without-comment-thread.input';
import { AttachmentUpsertWithWhereUniqueWithoutCommentThreadInput } from './attachment-upsert-with-where-unique-without-comment-thread.input';
import { AttachmentCreateManyCommentThreadInputEnvelope } from './attachment-create-many-comment-thread-input-envelope.input';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { AttachmentUpdateWithWhereUniqueWithoutCommentThreadInput } from './attachment-update-with-where-unique-without-comment-thread.input';
import { AttachmentUpdateManyWithWhereWithoutCommentThreadInput } from './attachment-update-many-with-where-without-comment-thread.input';
import { AttachmentScalarWhereInput } from './attachment-scalar-where.input';

@InputType()
export class AttachmentUpdateManyWithoutCommentThreadNestedInput {

    @Field(() => [AttachmentCreateWithoutCommentThreadInput], {nullable:true})
    @Type(() => AttachmentCreateWithoutCommentThreadInput)
    create?: Array<AttachmentCreateWithoutCommentThreadInput>;

    @Field(() => [AttachmentCreateOrConnectWithoutCommentThreadInput], {nullable:true})
    @Type(() => AttachmentCreateOrConnectWithoutCommentThreadInput)
    connectOrCreate?: Array<AttachmentCreateOrConnectWithoutCommentThreadInput>;

    @Field(() => [AttachmentUpsertWithWhereUniqueWithoutCommentThreadInput], {nullable:true})
    @Type(() => AttachmentUpsertWithWhereUniqueWithoutCommentThreadInput)
    upsert?: Array<AttachmentUpsertWithWhereUniqueWithoutCommentThreadInput>;

    @Field(() => AttachmentCreateManyCommentThreadInputEnvelope, {nullable:true})
    @Type(() => AttachmentCreateManyCommentThreadInputEnvelope)
    createMany?: AttachmentCreateManyCommentThreadInputEnvelope;

    @Field(() => [AttachmentWhereUniqueInput], {nullable:true})
    @Type(() => AttachmentWhereUniqueInput)
    set?: Array<AttachmentWhereUniqueInput>;

    @Field(() => [AttachmentWhereUniqueInput], {nullable:true})
    @Type(() => AttachmentWhereUniqueInput)
    disconnect?: Array<AttachmentWhereUniqueInput>;

    @Field(() => [AttachmentWhereUniqueInput], {nullable:true})
    @Type(() => AttachmentWhereUniqueInput)
    delete?: Array<AttachmentWhereUniqueInput>;

    @Field(() => [AttachmentWhereUniqueInput], {nullable:true})
    @Type(() => AttachmentWhereUniqueInput)
    connect?: Array<AttachmentWhereUniqueInput>;

    @Field(() => [AttachmentUpdateWithWhereUniqueWithoutCommentThreadInput], {nullable:true})
    @Type(() => AttachmentUpdateWithWhereUniqueWithoutCommentThreadInput)
    update?: Array<AttachmentUpdateWithWhereUniqueWithoutCommentThreadInput>;

    @Field(() => [AttachmentUpdateManyWithWhereWithoutCommentThreadInput], {nullable:true})
    @Type(() => AttachmentUpdateManyWithWhereWithoutCommentThreadInput)
    updateMany?: Array<AttachmentUpdateManyWithWhereWithoutCommentThreadInput>;

    @Field(() => [AttachmentScalarWhereInput], {nullable:true})
    @Type(() => AttachmentScalarWhereInput)
    deleteMany?: Array<AttachmentScalarWhereInput>;
}
