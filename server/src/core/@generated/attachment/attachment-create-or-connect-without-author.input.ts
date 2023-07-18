import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { Type } from 'class-transformer';
import { AttachmentCreateWithoutAuthorInput } from './attachment-create-without-author.input';

@InputType()
export class AttachmentCreateOrConnectWithoutAuthorInput {

    @Field(() => AttachmentWhereUniqueInput, {nullable:false})
    @Type(() => AttachmentWhereUniqueInput)
    where!: AttachmentWhereUniqueInput;

    @Field(() => AttachmentCreateWithoutAuthorInput, {nullable:false})
    @Type(() => AttachmentCreateWithoutAuthorInput)
    create!: AttachmentCreateWithoutAuthorInput;
}
