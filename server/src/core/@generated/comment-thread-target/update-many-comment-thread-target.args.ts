import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadTargetUpdateManyMutationInput } from './comment-thread-target-update-many-mutation.input';
import { Type } from 'class-transformer';
import { CommentThreadTargetWhereInput } from './comment-thread-target-where.input';

@ArgsType()
export class UpdateManyCommentThreadTargetArgs {

    @Field(() => CommentThreadTargetUpdateManyMutationInput, {nullable:false})
    @Type(() => CommentThreadTargetUpdateManyMutationInput)
    data!: CommentThreadTargetUpdateManyMutationInput;

    @Field(() => CommentThreadTargetWhereInput, {nullable:true})
    @Type(() => CommentThreadTargetWhereInput)
    where?: CommentThreadTargetWhereInput;
}
