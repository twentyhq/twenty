import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentCreateWithoutAuthorInput } from './attachment-create-without-author.input';
import { Type } from 'class-transformer';
import { AttachmentCreateOrConnectWithoutAuthorInput } from './attachment-create-or-connect-without-author.input';
import { AttachmentUpsertWithWhereUniqueWithoutAuthorInput } from './attachment-upsert-with-where-unique-without-author.input';
import { AttachmentCreateManyAuthorInputEnvelope } from './attachment-create-many-author-input-envelope.input';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { AttachmentUpdateWithWhereUniqueWithoutAuthorInput } from './attachment-update-with-where-unique-without-author.input';
import { AttachmentUpdateManyWithWhereWithoutAuthorInput } from './attachment-update-many-with-where-without-author.input';
import { AttachmentScalarWhereInput } from './attachment-scalar-where.input';

@InputType()
export class AttachmentUncheckedUpdateManyWithoutAuthorNestedInput {

    @Field(() => [AttachmentCreateWithoutAuthorInput], {nullable:true})
    @Type(() => AttachmentCreateWithoutAuthorInput)
    create?: Array<AttachmentCreateWithoutAuthorInput>;

    @Field(() => [AttachmentCreateOrConnectWithoutAuthorInput], {nullable:true})
    @Type(() => AttachmentCreateOrConnectWithoutAuthorInput)
    connectOrCreate?: Array<AttachmentCreateOrConnectWithoutAuthorInput>;

    @Field(() => [AttachmentUpsertWithWhereUniqueWithoutAuthorInput], {nullable:true})
    @Type(() => AttachmentUpsertWithWhereUniqueWithoutAuthorInput)
    upsert?: Array<AttachmentUpsertWithWhereUniqueWithoutAuthorInput>;

    @Field(() => AttachmentCreateManyAuthorInputEnvelope, {nullable:true})
    @Type(() => AttachmentCreateManyAuthorInputEnvelope)
    createMany?: AttachmentCreateManyAuthorInputEnvelope;

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

    @Field(() => [AttachmentUpdateWithWhereUniqueWithoutAuthorInput], {nullable:true})
    @Type(() => AttachmentUpdateWithWhereUniqueWithoutAuthorInput)
    update?: Array<AttachmentUpdateWithWhereUniqueWithoutAuthorInput>;

    @Field(() => [AttachmentUpdateManyWithWhereWithoutAuthorInput], {nullable:true})
    @Type(() => AttachmentUpdateManyWithWhereWithoutAuthorInput)
    updateMany?: Array<AttachmentUpdateManyWithWhereWithoutAuthorInput>;

    @Field(() => [AttachmentScalarWhereInput], {nullable:true})
    @Type(() => AttachmentScalarWhereInput)
    deleteMany?: Array<AttachmentScalarWhereInput>;
}
