import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentCreateManyAuthorInput } from './attachment-create-many-author.input';
import { Type } from 'class-transformer';

@InputType()
export class AttachmentCreateManyAuthorInputEnvelope {

    @Field(() => [AttachmentCreateManyAuthorInput], {nullable:false})
    @Type(() => AttachmentCreateManyAuthorInput)
    data!: Array<AttachmentCreateManyAuthorInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
