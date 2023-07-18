import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { AttachmentCreateInput } from './attachment-create.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateOneAttachmentArgs {

    @Field(() => AttachmentCreateInput, {nullable:false})
    @Type(() => AttachmentCreateInput)
    @Type(() => AttachmentCreateInput)
    @ValidateNested({each: true})
    data!: AttachmentCreateInput;
}
