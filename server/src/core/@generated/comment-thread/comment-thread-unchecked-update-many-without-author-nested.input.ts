import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutAuthorInput } from './comment-thread-create-without-author.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateOrConnectWithoutAuthorInput } from './comment-thread-create-or-connect-without-author.input';
import { CommentThreadUpsertWithWhereUniqueWithoutAuthorInput } from './comment-thread-upsert-with-where-unique-without-author.input';
import { CommentThreadCreateManyAuthorInputEnvelope } from './comment-thread-create-many-author-input-envelope.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadUpdateWithWhereUniqueWithoutAuthorInput } from './comment-thread-update-with-where-unique-without-author.input';
import { CommentThreadUpdateManyWithWhereWithoutAuthorInput } from './comment-thread-update-many-with-where-without-author.input';
import { CommentThreadScalarWhereInput } from './comment-thread-scalar-where.input';

@InputType()
export class CommentThreadUncheckedUpdateManyWithoutAuthorNestedInput {

    @HideField()
    create?: Array<CommentThreadCreateWithoutAuthorInput>;

    @HideField()
    connectOrCreate?: Array<CommentThreadCreateOrConnectWithoutAuthorInput>;

    @HideField()
    upsert?: Array<CommentThreadUpsertWithWhereUniqueWithoutAuthorInput>;

    @HideField()
    createMany?: CommentThreadCreateManyAuthorInputEnvelope;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    set?: Array<CommentThreadWhereUniqueInput>;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    disconnect?: Array<CommentThreadWhereUniqueInput>;

    @HideField()
    delete?: Array<CommentThreadWhereUniqueInput>;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    connect?: Array<CommentThreadWhereUniqueInput>;

    @HideField()
    update?: Array<CommentThreadUpdateWithWhereUniqueWithoutAuthorInput>;

    @HideField()
    updateMany?: Array<CommentThreadUpdateManyWithWhereWithoutAuthorInput>;

    @HideField()
    deleteMany?: Array<CommentThreadScalarWhereInput>;
}
