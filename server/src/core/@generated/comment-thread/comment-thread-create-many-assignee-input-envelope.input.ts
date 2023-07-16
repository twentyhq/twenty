import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateManyAssigneeInput } from './comment-thread-create-many-assignee.input';
import { Type } from 'class-transformer';

@InputType()
export class CommentThreadCreateManyAssigneeInputEnvelope {

    @Field(() => [CommentThreadCreateManyAssigneeInput], {nullable:false})
    @Type(() => CommentThreadCreateManyAssigneeInput)
    data!: Array<CommentThreadCreateManyAssigneeInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
