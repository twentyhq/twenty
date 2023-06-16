import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';

@ArgsType()
export class FindUniqueCommentThreadOrThrowArgs {

    @Field(() => CommentThreadWhereUniqueInput, {nullable:false})
    @Type(() => CommentThreadWhereUniqueInput)
    where!: CommentThreadWhereUniqueInput;
}
