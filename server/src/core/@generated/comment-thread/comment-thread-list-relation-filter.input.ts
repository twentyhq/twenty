import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadWhereInput } from './comment-thread-where.input';

@InputType()
export class CommentThreadListRelationFilter {

    @Field(() => CommentThreadWhereInput, {nullable:true})
    every?: CommentThreadWhereInput;

    @Field(() => CommentThreadWhereInput, {nullable:true})
    some?: CommentThreadWhereInput;

    @Field(() => CommentThreadWhereInput, {nullable:true})
    none?: CommentThreadWhereInput;
}
