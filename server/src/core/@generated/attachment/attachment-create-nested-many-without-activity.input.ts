import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentCreateWithoutActivityInput } from './attachment-create-without-activity.input';
import { Type } from 'class-transformer';
import { AttachmentCreateOrConnectWithoutActivityInput } from './attachment-create-or-connect-without-activity.input';
import { AttachmentCreateManyActivityInputEnvelope } from './attachment-create-many-activity-input-envelope.input';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';

@InputType()
export class AttachmentCreateNestedManyWithoutActivityInput {

    @Field(() => [AttachmentCreateWithoutActivityInput], {nullable:true})
    @Type(() => AttachmentCreateWithoutActivityInput)
    create?: Array<AttachmentCreateWithoutActivityInput>;

    @Field(() => [AttachmentCreateOrConnectWithoutActivityInput], {nullable:true})
    @Type(() => AttachmentCreateOrConnectWithoutActivityInput)
    connectOrCreate?: Array<AttachmentCreateOrConnectWithoutActivityInput>;

    @Field(() => AttachmentCreateManyActivityInputEnvelope, {nullable:true})
    @Type(() => AttachmentCreateManyActivityInputEnvelope)
    createMany?: AttachmentCreateManyActivityInputEnvelope;

    @Field(() => [AttachmentWhereUniqueInput], {nullable:true})
    @Type(() => AttachmentWhereUniqueInput)
    connect?: Array<AttachmentWhereUniqueInput>;
}
