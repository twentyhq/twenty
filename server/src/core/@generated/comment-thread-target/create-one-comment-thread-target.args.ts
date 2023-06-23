import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadTargetCreateInput } from './comment-thread-target-create.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateOneCommentThreadTargetArgs {

    @Field(() => CommentThreadTargetCreateInput, {nullable:false})
    @Type(() => CommentThreadTargetCreateInput)
    data!: CommentThreadTargetCreateInput;
}
