import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadTargetCreateInput } from './comment-thread-target-create.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateOneCommentThreadTargetArgs {

    @Field(() => CommentThreadTargetCreateInput, {nullable:false})
    @Type(() => CommentThreadTargetCreateInput)
    @ValidateNested({each: true})
    @Type(() => CommentThreadTargetCreateInput)
    data!: CommentThreadTargetCreateInput;
}
