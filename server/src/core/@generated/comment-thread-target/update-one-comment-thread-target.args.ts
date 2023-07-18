import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadTargetUpdateInput } from './comment-thread-target-update.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CommentThreadTargetWhereUniqueInput } from './comment-thread-target-where-unique.input';

@ArgsType()
export class UpdateOneCommentThreadTargetArgs {

    @Field(() => CommentThreadTargetUpdateInput, {nullable:false})
    @Type(() => CommentThreadTargetUpdateInput)
    @Type(() => CommentThreadTargetUpdateInput)
    @ValidateNested({each: true})
    data!: CommentThreadTargetUpdateInput;

    @Field(() => CommentThreadTargetWhereUniqueInput, {nullable:false})
    @Type(() => CommentThreadTargetWhereUniqueInput)
    where!: CommentThreadTargetWhereUniqueInput;
}
