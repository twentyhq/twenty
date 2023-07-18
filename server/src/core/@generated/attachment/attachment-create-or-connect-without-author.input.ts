import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { Type } from 'class-transformer';
import { AttachmentCreateWithoutAuthorInput } from './attachment-create-without-author.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class AttachmentCreateOrConnectWithoutAuthorInput {

    @Field(() => AttachmentWhereUniqueInput, {nullable:false})
    @Type(() => AttachmentWhereUniqueInput)
    where!: AttachmentWhereUniqueInput;

    @HideField()
    create!: AttachmentCreateWithoutAuthorInput;
}
