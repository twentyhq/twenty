import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadUpdateManyMutationInput } from './comment-thread-update-many-mutation.input';
import { Type } from 'class-transformer';
import { CommentThreadWhereInput } from './comment-thread-where.input';

@ArgsType()
export class UpdateManyCommentThreadArgs {

    @Field(() => CommentThreadUpdateManyMutationInput, {nullable:false})
    @Type(() => CommentThreadUpdateManyMutationInput)
    data!: CommentThreadUpdateManyMutationInput;

    @Field(() => CommentThreadWhereInput, {nullable:true})
    @Type(() => CommentThreadWhereInput)
    where?: CommentThreadWhereInput;
}
