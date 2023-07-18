import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentCreateWithoutAuthorInput } from './comment-create-without-author.input';
import { HideField } from '@nestjs/graphql';
import { CommentCreateOrConnectWithoutAuthorInput } from './comment-create-or-connect-without-author.input';
import { CommentCreateManyAuthorInputEnvelope } from './comment-create-many-author-input-envelope.input';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class CommentUncheckedCreateNestedManyWithoutAuthorInput {

    @HideField()
    create?: Array<CommentCreateWithoutAuthorInput>;

    @HideField()
    connectOrCreate?: Array<CommentCreateOrConnectWithoutAuthorInput>;

    @HideField()
    createMany?: CommentCreateManyAuthorInputEnvelope;

    @Field(() => [CommentWhereUniqueInput], {nullable:true})
    @Type(() => CommentWhereUniqueInput)
    connect?: Array<CommentWhereUniqueInput>;
}
