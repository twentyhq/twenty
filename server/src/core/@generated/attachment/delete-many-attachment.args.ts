import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { AttachmentWhereInput } from './attachment-where.input';
import { Type } from 'class-transformer';

@ArgsType()
export class DeleteManyAttachmentArgs {

    @Field(() => AttachmentWhereInput, {nullable:true})
    @Type(() => AttachmentWhereInput)
    where?: AttachmentWhereInput;
}
