import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadTargetScalarWhereInput } from './comment-thread-target-scalar-where.input';
import { Type } from 'class-transformer';
import { CommentThreadTargetUpdateManyMutationInput } from './comment-thread-target-update-many-mutation.input';

@InputType()
export class CommentThreadTargetUpdateManyWithWhereWithoutCommentThreadInput {

    @Field(() => CommentThreadTargetScalarWhereInput, {nullable:false})
    @Type(() => CommentThreadTargetScalarWhereInput)
    where!: CommentThreadTargetScalarWhereInput;

    @Field(() => CommentThreadTargetUpdateManyMutationInput, {nullable:false})
    @Type(() => CommentThreadTargetUpdateManyMutationInput)
    data!: CommentThreadTargetUpdateManyMutationInput;
}
