import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { AttachmentUpdateManyMutationInput } from './attachment-update-many-mutation.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { AttachmentWhereInput } from './attachment-where.input';

@ArgsType()
export class UpdateManyAttachmentArgs {

    @Field(() => AttachmentUpdateManyMutationInput, {nullable:false})
    @Type(() => AttachmentUpdateManyMutationInput)
    @ValidateNested({each: true})
    @Type(() => AttachmentUpdateManyMutationInput)
    data!: AttachmentUpdateManyMutationInput;

    @Field(() => AttachmentWhereInput, {nullable:true})
    @Type(() => AttachmentWhereInput)
    where?: AttachmentWhereInput;
}
