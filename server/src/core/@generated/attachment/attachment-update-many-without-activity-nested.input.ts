import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentCreateWithoutActivityInput } from './attachment-create-without-activity.input';
import { HideField } from '@nestjs/graphql';
import { AttachmentCreateOrConnectWithoutActivityInput } from './attachment-create-or-connect-without-activity.input';
import { AttachmentUpsertWithWhereUniqueWithoutActivityInput } from './attachment-upsert-with-where-unique-without-activity.input';
import { AttachmentCreateManyActivityInputEnvelope } from './attachment-create-many-activity-input-envelope.input';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { Type } from 'class-transformer';
import { AttachmentUpdateWithWhereUniqueWithoutActivityInput } from './attachment-update-with-where-unique-without-activity.input';
import { AttachmentUpdateManyWithWhereWithoutActivityInput } from './attachment-update-many-with-where-without-activity.input';
import { AttachmentScalarWhereInput } from './attachment-scalar-where.input';

@InputType()
export class AttachmentUpdateManyWithoutActivityNestedInput {

    @HideField()
    create?: Array<AttachmentCreateWithoutActivityInput>;

    @HideField()
    connectOrCreate?: Array<AttachmentCreateOrConnectWithoutActivityInput>;

    @HideField()
    upsert?: Array<AttachmentUpsertWithWhereUniqueWithoutActivityInput>;

    @HideField()
    createMany?: AttachmentCreateManyActivityInputEnvelope;

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
    update?: Array<AttachmentUpdateWithWhereUniqueWithoutActivityInput>;

    @HideField()
    updateMany?: Array<AttachmentUpdateManyWithWhereWithoutActivityInput>;

    @HideField()
    deleteMany?: Array<AttachmentScalarWhereInput>;
}
