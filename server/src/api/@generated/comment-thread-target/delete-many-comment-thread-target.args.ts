import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadTargetWhereInput } from './comment-thread-target-where.input';
import { Type } from 'class-transformer';

@ArgsType()
export class DeleteManyCommentThreadTargetArgs {

    @Field(() => CommentThreadTargetWhereInput, {nullable:true})
    @Type(() => CommentThreadTargetWhereInput)
    where?: CommentThreadTargetWhereInput;
}
