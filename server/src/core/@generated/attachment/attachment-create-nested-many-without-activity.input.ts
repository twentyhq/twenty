import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentCreateWithoutActivityInput } from './attachment-create-without-activity.input';
import { HideField } from '@nestjs/graphql';
import { AttachmentCreateOrConnectWithoutActivityInput } from './attachment-create-or-connect-without-activity.input';
import { AttachmentCreateManyActivityInputEnvelope } from './attachment-create-many-activity-input-envelope.input';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class AttachmentCreateNestedManyWithoutActivityInput {

    @HideField()
    create?: Array<AttachmentCreateWithoutActivityInput>;

    @HideField()
    connectOrCreate?: Array<AttachmentCreateOrConnectWithoutActivityInput>;

    @HideField()
    createMany?: AttachmentCreateManyActivityInputEnvelope;

    @Field(() => [AttachmentWhereUniqueInput], {nullable:true})
    @Type(() => AttachmentWhereUniqueInput)
    connect?: Array<AttachmentWhereUniqueInput>;
}
