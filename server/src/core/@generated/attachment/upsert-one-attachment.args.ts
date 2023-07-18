import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { Type } from 'class-transformer';
import { AttachmentCreateInput } from './attachment-create.input';
import { AttachmentUpdateInput } from './attachment-update.input';

@ArgsType()
export class UpsertOneAttachmentArgs {

    @Field(() => AttachmentWhereUniqueInput, {nullable:false})
    @Type(() => AttachmentWhereUniqueInput)
    where!: AttachmentWhereUniqueInput;

    @Field(() => AttachmentCreateInput, {nullable:false})
    @Type(() => AttachmentCreateInput)
    create!: AttachmentCreateInput;

    @Field(() => AttachmentUpdateInput, {nullable:false})
    @Type(() => AttachmentUpdateInput)
    update!: AttachmentUpdateInput;
}
