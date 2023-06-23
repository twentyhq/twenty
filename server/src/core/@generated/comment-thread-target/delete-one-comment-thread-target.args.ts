import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadTargetWhereUniqueInput } from './comment-thread-target-where-unique.input';
import { Type } from 'class-transformer';

@ArgsType()
export class DeleteOneCommentThreadTargetArgs {

    @Field(() => CommentThreadTargetWhereUniqueInput, {nullable:false})
    @Type(() => CommentThreadTargetWhereUniqueInput)
    where!: CommentThreadTargetWhereUniqueInput;
}
