import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { Type } from 'class-transformer';
import { AttachmentUpdateWithoutActivityInput } from './attachment-update-without-activity.input';
import { AttachmentCreateWithoutActivityInput } from './attachment-create-without-activity.input';

@InputType()
export class AttachmentUpsertWithWhereUniqueWithoutActivityInput {

    @Field(() => AttachmentWhereUniqueInput, {nullable:false})
    @Type(() => AttachmentWhereUniqueInput)
    where!: AttachmentWhereUniqueInput;

    @Field(() => AttachmentUpdateWithoutActivityInput, {nullable:false})
    @Type(() => AttachmentUpdateWithoutActivityInput)
    update!: AttachmentUpdateWithoutActivityInput;

    @Field(() => AttachmentCreateWithoutActivityInput, {nullable:false})
    @Type(() => AttachmentCreateWithoutActivityInput)
    create!: AttachmentCreateWithoutActivityInput;
}
