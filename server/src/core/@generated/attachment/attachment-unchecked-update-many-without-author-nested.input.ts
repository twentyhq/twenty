import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentCreateWithoutAuthorInput } from './attachment-create-without-author.input';
import { HideField } from '@nestjs/graphql';
import { AttachmentCreateOrConnectWithoutAuthorInput } from './attachment-create-or-connect-without-author.input';
import { AttachmentUpsertWithWhereUniqueWithoutAuthorInput } from './attachment-upsert-with-where-unique-without-author.input';
import { AttachmentCreateManyAuthorInputEnvelope } from './attachment-create-many-author-input-envelope.input';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { Type } from 'class-transformer';
import { AttachmentUpdateWithWhereUniqueWithoutAuthorInput } from './attachment-update-with-where-unique-without-author.input';
import { AttachmentUpdateManyWithWhereWithoutAuthorInput } from './attachment-update-many-with-where-without-author.input';
import { AttachmentScalarWhereInput } from './attachment-scalar-where.input';

@InputType()
export class AttachmentUncheckedUpdateManyWithoutAuthorNestedInput {

    @HideField()
    create?: Array<AttachmentCreateWithoutAuthorInput>;

    @HideField()
    connectOrCreate?: Array<AttachmentCreateOrConnectWithoutAuthorInput>;

    @HideField()
    upsert?: Array<AttachmentUpsertWithWhereUniqueWithoutAuthorInput>;

    @HideField()
    createMany?: AttachmentCreateManyAuthorInputEnvelope;

    @Field(() => [AttachmentWhereUniqueInput], {nullable:true})
    @Type(() => AttachmentWhereUniqueInput)
    set?: Array<AttachmentWhereUniqueInput>;

    @Field(() => [AttachmentWhereUniqueInput], {nullable:true})
    @Type(() => AttachmentWhereUniqueInput)
    disconnect?: Array<AttachmentWhereUniqueInput>;

    @HideField()
    delete?: Array<AttachmentWhereUniqueInput>;

    @Field(() => [AttachmentWhereUniqueInput], {nullable:true})
    @Type(() => AttachmentWhereUniqueInput)
    connect?: Array<AttachmentWhereUniqueInput>;

    @HideField()
    update?: Array<AttachmentUpdateWithWhereUniqueWithoutAuthorInput>;

    @HideField()
    updateMany?: Array<AttachmentUpdateManyWithWhereWithoutAuthorInput>;

    @HideField()
    deleteMany?: Array<AttachmentScalarWhereInput>;
}
