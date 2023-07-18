import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { Type } from 'class-transformer';
import { AttachmentCreateInput } from './attachment-create.input';
import { HideField } from '@nestjs/graphql';
import { AttachmentUpdateInput } from './attachment-update.input';

@ArgsType()
export class UpsertOneAttachmentArgs {

    @Field(() => AttachmentWhereUniqueInput, {nullable:false})
    @Type(() => AttachmentWhereUniqueInput)
    where!: AttachmentWhereUniqueInput;

    @HideField()
    create!: AttachmentCreateInput;

    @HideField()
    update!: AttachmentUpdateInput;
}
