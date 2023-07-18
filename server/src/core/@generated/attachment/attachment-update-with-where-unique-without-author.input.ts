import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { Type } from 'class-transformer';
import { AttachmentUpdateWithoutAuthorInput } from './attachment-update-without-author.input';

@InputType()
export class AttachmentUpdateWithWhereUniqueWithoutAuthorInput {

    @Field(() => AttachmentWhereUniqueInput, {nullable:false})
    @Type(() => AttachmentWhereUniqueInput)
    where!: AttachmentWhereUniqueInput;

    @Field(() => AttachmentUpdateWithoutAuthorInput, {nullable:false})
    @Type(() => AttachmentUpdateWithoutAuthorInput)
    data!: AttachmentUpdateWithoutAuthorInput;
}
