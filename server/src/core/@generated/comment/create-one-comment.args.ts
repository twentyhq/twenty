import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentCreateInput } from './comment-create.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateOneCommentArgs {

    @Field(() => CommentCreateInput, {nullable:false})
    @Type(() => CommentCreateInput)
    data!: CommentCreateInput;
}
