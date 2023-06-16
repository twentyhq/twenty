import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadTargetWhereUniqueInput } from './comment-thread-target-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadTargetCreateInput } from './comment-thread-target-create.input';
import { CommentThreadTargetUpdateInput } from './comment-thread-target-update.input';

@ArgsType()
export class UpsertOneCommentThreadTargetArgs {

    @Field(() => CommentThreadTargetWhereUniqueInput, {nullable:false})
    @Type(() => CommentThreadTargetWhereUniqueInput)
    where!: CommentThreadTargetWhereUniqueInput;

    @Field(() => CommentThreadTargetCreateInput, {nullable:false})
    @Type(() => CommentThreadTargetCreateInput)
    create!: CommentThreadTargetCreateInput;

    @Field(() => CommentThreadTargetUpdateInput, {nullable:false})
    @Type(() => CommentThreadTargetUpdateInput)
    update!: CommentThreadTargetUpdateInput;
}
