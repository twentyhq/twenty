import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { Type } from 'class-transformer';
import { AttachmentUpdateWithoutAuthorInput } from './attachment-update-without-author.input';
import { AttachmentCreateWithoutAuthorInput } from './attachment-create-without-author.input';

@InputType()
export class AttachmentUpsertWithWhereUniqueWithoutAuthorInput {

    @Field(() => AttachmentWhereUniqueInput, {nullable:false})
    @Type(() => AttachmentWhereUniqueInput)
    where!: AttachmentWhereUniqueInput;

    @Field(() => AttachmentUpdateWithoutAuthorInput, {nullable:false})
    @Type(() => AttachmentUpdateWithoutAuthorInput)
    update!: AttachmentUpdateWithoutAuthorInput;

    @Field(() => AttachmentCreateWithoutAuthorInput, {nullable:false})
    @Type(() => AttachmentCreateWithoutAuthorInput)
    create!: AttachmentCreateWithoutAuthorInput;
}
