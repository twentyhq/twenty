import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentCreateWithoutActivityInput } from './attachment-create-without-activity.input';
import { Type } from 'class-transformer';
import { AttachmentCreateOrConnectWithoutActivityInput } from './attachment-create-or-connect-without-activity.input';
import { AttachmentUpsertWithWhereUniqueWithoutActivityInput } from './attachment-upsert-with-where-unique-without-activity.input';
import { AttachmentCreateManyActivityInputEnvelope } from './attachment-create-many-activity-input-envelope.input';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { AttachmentUpdateWithWhereUniqueWithoutActivityInput } from './attachment-update-with-where-unique-without-activity.input';
import { AttachmentUpdateManyWithWhereWithoutActivityInput } from './attachment-update-many-with-where-without-activity.input';
import { AttachmentScalarWhereInput } from './attachment-scalar-where.input';

@InputType()
export class AttachmentUncheckedUpdateManyWithoutActivityNestedInput {

    @Field(() => [AttachmentCreateWithoutActivityInput], {nullable:true})
    @Type(() => AttachmentCreateWithoutActivityInput)
    create?: Array<AttachmentCreateWithoutActivityInput>;

    @Field(() => [AttachmentCreateOrConnectWithoutActivityInput], {nullable:true})
    @Type(() => AttachmentCreateOrConnectWithoutActivityInput)
    connectOrCreate?: Array<AttachmentCreateOrConnectWithoutActivityInput>;

    @Field(() => [AttachmentUpsertWithWhereUniqueWithoutActivityInput], {nullable:true})
    @Type(() => AttachmentUpsertWithWhereUniqueWithoutActivityInput)
    upsert?: Array<AttachmentUpsertWithWhereUniqueWithoutActivityInput>;

    @Field(() => AttachmentCreateManyActivityInputEnvelope, {nullable:true})
    @Type(() => AttachmentCreateManyActivityInputEnvelope)
    createMany?: AttachmentCreateManyActivityInputEnvelope;

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

    @Field(() => [AttachmentUpdateWithWhereUniqueWithoutActivityInput], {nullable:true})
    @Type(() => AttachmentUpdateWithWhereUniqueWithoutActivityInput)
    update?: Array<AttachmentUpdateWithWhereUniqueWithoutActivityInput>;

    @Field(() => [AttachmentUpdateManyWithWhereWithoutActivityInput], {nullable:true})
    @Type(() => AttachmentUpdateManyWithWhereWithoutActivityInput)
    updateMany?: Array<AttachmentUpdateManyWithWhereWithoutActivityInput>;

    @Field(() => [AttachmentScalarWhereInput], {nullable:true})
    @Type(() => AttachmentScalarWhereInput)
    deleteMany?: Array<AttachmentScalarWhereInput>;
}
