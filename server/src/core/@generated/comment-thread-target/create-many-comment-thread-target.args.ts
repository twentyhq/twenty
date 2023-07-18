import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadTargetCreateManyInput } from './comment-thread-target-create-many.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateManyCommentThreadTargetArgs {

    @Field(() => [CommentThreadTargetCreateManyInput], {nullable:false})
    @Type(() => CommentThreadTargetCreateManyInput)
    @Type(() => CommentThreadTargetCreateManyInput)
    @ValidateNested({each: true})
    data!: Array<CommentThreadTargetCreateManyInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
