import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentCreateManyCommentThreadInput } from './attachment-create-many-comment-thread.input';
import { Type } from 'class-transformer';

@InputType()
export class AttachmentCreateManyCommentThreadInputEnvelope {

    @Field(() => [AttachmentCreateManyCommentThreadInput], {nullable:false})
    @Type(() => AttachmentCreateManyCommentThreadInput)
    data!: Array<AttachmentCreateManyCommentThreadInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
