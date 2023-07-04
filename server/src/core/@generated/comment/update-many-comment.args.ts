import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentUpdateManyMutationInput } from './comment-update-many-mutation.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CommentWhereInput } from './comment-where.input';

@ArgsType()
export class UpdateManyCommentArgs {

    @Field(() => CommentUpdateManyMutationInput, {nullable:false})
    @Type(() => CommentUpdateManyMutationInput)
    @Type(() => CommentUpdateManyMutationInput)
    @ValidateNested({each: true})
    data!: CommentUpdateManyMutationInput;

    @Field(() => CommentWhereInput, {nullable:true})
    @Type(() => CommentWhereInput)
    where?: CommentWhereInput;
}
