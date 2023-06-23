import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadWhereInput } from './comment-thread-where.input';

@InputType()
export class CommentThreadRelationFilter {

    @Field(() => CommentThreadWhereInput, {nullable:true})
    is?: CommentThreadWhereInput;

    @Field(() => CommentThreadWhereInput, {nullable:true})
    isNot?: CommentThreadWhereInput;
}
