import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { Type } from 'class-transformer';
import { AttachmentUpdateWithoutActivityInput } from './attachment-update-without-activity.input';

@InputType()
export class AttachmentUpdateWithWhereUniqueWithoutActivityInput {

    @Field(() => AttachmentWhereUniqueInput, {nullable:false})
    @Type(() => AttachmentWhereUniqueInput)
    where!: AttachmentWhereUniqueInput;

    @Field(() => AttachmentUpdateWithoutActivityInput, {nullable:false})
    @Type(() => AttachmentUpdateWithoutActivityInput)
    data!: AttachmentUpdateWithoutActivityInput;
}
