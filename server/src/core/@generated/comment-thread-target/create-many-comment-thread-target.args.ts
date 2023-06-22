import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadTargetCreateManyInput } from './comment-thread-target-create-many.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateManyCommentThreadTargetArgs {

    @Field(() => [CommentThreadTargetCreateManyInput], {nullable:false})
    @Type(() => CommentThreadTargetCreateManyInput)
    data!: Array<CommentThreadTargetCreateManyInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
