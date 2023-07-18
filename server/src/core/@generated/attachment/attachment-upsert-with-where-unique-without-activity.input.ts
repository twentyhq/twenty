import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { Type } from 'class-transformer';
import { AttachmentUpdateWithoutActivityInput } from './attachment-update-without-activity.input';
import { HideField } from '@nestjs/graphql';
import { AttachmentCreateWithoutActivityInput } from './attachment-create-without-activity.input';

@InputType()
export class AttachmentUpsertWithWhereUniqueWithoutActivityInput {

    @Field(() => AttachmentWhereUniqueInput, {nullable:false})
    @Type(() => AttachmentWhereUniqueInput)
    where!: AttachmentWhereUniqueInput;

    @HideField()
    update!: AttachmentUpdateWithoutActivityInput;

    @HideField()
    create!: AttachmentCreateWithoutActivityInput;
}
