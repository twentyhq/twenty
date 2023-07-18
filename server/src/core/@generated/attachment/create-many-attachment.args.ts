import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { AttachmentCreateManyInput } from './attachment-create-many.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateManyAttachmentArgs {

    @Field(() => [AttachmentCreateManyInput], {nullable:false})
    @Type(() => AttachmentCreateManyInput)
    @Type(() => AttachmentCreateManyInput)
    @ValidateNested({each: true})
    data!: Array<AttachmentCreateManyInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
