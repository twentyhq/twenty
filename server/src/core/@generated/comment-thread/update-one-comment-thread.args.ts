import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadUpdateInput } from './comment-thread-update.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';

@ArgsType()
export class UpdateOneCommentThreadArgs {

    @Field(() => CommentThreadUpdateInput, {nullable:false})
    @Type(() => CommentThreadUpdateInput)
    @Type(() => CommentThreadUpdateInput)
    @ValidateNested({each: true})
    data!: CommentThreadUpdateInput;

    @Field(() => CommentThreadWhereUniqueInput, {nullable:false})
    @Type(() => CommentThreadWhereUniqueInput)
    where!: CommentThreadWhereUniqueInput;
}
