import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadCreateInput } from './comment-thread-create.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateOneCommentThreadArgs {

    @Field(() => CommentThreadCreateInput, {nullable:false})
    @Type(() => CommentThreadCreateInput)
    @Type(() => CommentThreadCreateInput)
    @ValidateNested({each: true})
    data!: CommentThreadCreateInput;
}
