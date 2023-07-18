import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutCommentsInput } from './comment-thread-create-without-comments.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateOrConnectWithoutCommentsInput } from './comment-thread-create-or-connect-without-comments.input';
import { CommentThreadUpsertWithoutCommentsInput } from './comment-thread-upsert-without-comments.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadUpdateWithoutCommentsInput } from './comment-thread-update-without-comments.input';

@InputType()
export class CommentThreadUpdateOneRequiredWithoutCommentsNestedInput {

    @HideField()
    create?: CommentThreadCreateWithoutCommentsInput;

    @HideField()
    connectOrCreate?: CommentThreadCreateOrConnectWithoutCommentsInput;

    @HideField()
    upsert?: CommentThreadUpsertWithoutCommentsInput;

    @Field(() => CommentThreadWhereUniqueInput, {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    connect?: CommentThreadWhereUniqueInput;

    @HideField()
    update?: CommentThreadUpdateWithoutCommentsInput;
}
