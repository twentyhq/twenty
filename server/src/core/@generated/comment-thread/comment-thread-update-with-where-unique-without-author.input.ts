import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadUpdateWithoutAuthorInput } from './comment-thread-update-without-author.input';

@InputType()
export class CommentThreadUpdateWithWhereUniqueWithoutAuthorInput {

    @Field(() => CommentThreadWhereUniqueInput, {nullable:false})
    @Type(() => CommentThreadWhereUniqueInput)
    where!: CommentThreadWhereUniqueInput;

    @Field(() => CommentThreadUpdateWithoutAuthorInput, {nullable:false})
    @Type(() => CommentThreadUpdateWithoutAuthorInput)
    data!: CommentThreadUpdateWithoutAuthorInput;
}
