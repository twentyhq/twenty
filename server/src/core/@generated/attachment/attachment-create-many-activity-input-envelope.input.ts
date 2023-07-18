import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentCreateManyActivityInput } from './attachment-create-many-activity.input';
import { Type } from 'class-transformer';

@InputType()
export class AttachmentCreateManyActivityInputEnvelope {

    @Field(() => [AttachmentCreateManyActivityInput], {nullable:false})
    @Type(() => AttachmentCreateManyActivityInput)
    data!: Array<AttachmentCreateManyActivityInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
