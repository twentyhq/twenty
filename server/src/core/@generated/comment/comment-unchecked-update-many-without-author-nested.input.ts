import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentCreateWithoutAuthorInput } from './comment-create-without-author.input';
import { HideField } from '@nestjs/graphql';
import { CommentCreateOrConnectWithoutAuthorInput } from './comment-create-or-connect-without-author.input';
import { CommentUpsertWithWhereUniqueWithoutAuthorInput } from './comment-upsert-with-where-unique-without-author.input';
import { CommentCreateManyAuthorInputEnvelope } from './comment-create-many-author-input-envelope.input';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { Type } from 'class-transformer';
import { CommentUpdateWithWhereUniqueWithoutAuthorInput } from './comment-update-with-where-unique-without-author.input';
import { CommentUpdateManyWithWhereWithoutAuthorInput } from './comment-update-many-with-where-without-author.input';
import { CommentScalarWhereInput } from './comment-scalar-where.input';

@InputType()
export class CommentUncheckedUpdateManyWithoutAuthorNestedInput {

    @HideField()
    create?: Array<CommentCreateWithoutAuthorInput>;

    @HideField()
    connectOrCreate?: Array<CommentCreateOrConnectWithoutAuthorInput>;

    @HideField()
    upsert?: Array<CommentUpsertWithWhereUniqueWithoutAuthorInput>;

    @HideField()
    createMany?: CommentCreateManyAuthorInputEnvelope;

    @Field(() => [CommentWhereUniqueInput], {nullable:true})
    @Type(() => CommentWhereUniqueInput)
    set?: Array<CommentWhereUniqueInput>;

    @Field(() => [CommentWhereUniqueInput], {nullable:true})
    @Type(() => CommentWhereUniqueInput)
    disconnect?: Array<CommentWhereUniqueInput>;

    @HideField()
    delete?: Array<CommentWhereUniqueInput>;

    @Field(() => [CommentWhereUniqueInput], {nullable:true})
    @Type(() => CommentWhereUniqueInput)
    connect?: Array<CommentWhereUniqueInput>;

    @HideField()
    update?: Array<CommentUpdateWithWhereUniqueWithoutAuthorInput>;

    @HideField()
    updateMany?: Array<CommentUpdateManyWithWhereWithoutAuthorInput>;

    @HideField()
    deleteMany?: Array<CommentScalarWhereInput>;
}
