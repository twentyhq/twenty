import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentCreateInput } from './comment-create.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateOneCommentArgs {

    @Field(() => CommentCreateInput, {nullable:false})
    @Type(() => CommentCreateInput)
    @Type(() => CommentCreateInput)
    @ValidateNested({each: true})
    data!: CommentCreateInput;
}
