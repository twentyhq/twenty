import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { Type } from 'class-transformer';
import { AttachmentCreateWithoutActivityInput } from './attachment-create-without-activity.input';

@InputType()
export class AttachmentCreateOrConnectWithoutActivityInput {

    @Field(() => AttachmentWhereUniqueInput, {nullable:false})
    @Type(() => AttachmentWhereUniqueInput)
    where!: AttachmentWhereUniqueInput;

    @Field(() => AttachmentCreateWithoutActivityInput, {nullable:false})
    @Type(() => AttachmentCreateWithoutActivityInput)
    create!: AttachmentCreateWithoutActivityInput;
}
