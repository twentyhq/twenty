import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutAuthorInput } from './comment-thread-create-without-author.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateOrConnectWithoutAuthorInput } from './comment-thread-create-or-connect-without-author.input';
import { CommentThreadCreateManyAuthorInputEnvelope } from './comment-thread-create-many-author-input-envelope.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class CommentThreadCreateNestedManyWithoutAuthorInput {

    @HideField()
    create?: Array<CommentThreadCreateWithoutAuthorInput>;

    @HideField()
    connectOrCreate?: Array<CommentThreadCreateOrConnectWithoutAuthorInput>;

    @HideField()
    createMany?: CommentThreadCreateManyAuthorInputEnvelope;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    connect?: Array<CommentThreadWhereUniqueInput>;
}
