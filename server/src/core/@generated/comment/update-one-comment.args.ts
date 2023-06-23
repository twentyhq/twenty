import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentUpdateInput } from './comment-update.input';
import { Type } from 'class-transformer';
import { CommentWhereUniqueInput } from './comment-where-unique.input';

@ArgsType()
export class UpdateOneCommentArgs {

    @Field(() => CommentUpdateInput, {nullable:false})
    @Type(() => CommentUpdateInput)
    data!: CommentUpdateInput;

    @Field(() => CommentWhereUniqueInput, {nullable:false})
    @Type(() => CommentWhereUniqueInput)
    where!: CommentWhereUniqueInput;
}
