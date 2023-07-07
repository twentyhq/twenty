import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutAuthorInput } from './comment-thread-create-without-author.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateOrConnectWithoutAuthorInput } from './comment-thread-create-or-connect-without-author.input';
import { CommentThreadUpsertWithWhereUniqueWithoutAuthorInput } from './comment-thread-upsert-with-where-unique-without-author.input';
import { CommentThreadCreateManyAuthorInputEnvelope } from './comment-thread-create-many-author-input-envelope.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { CommentThreadUpdateWithWhereUniqueWithoutAuthorInput } from './comment-thread-update-with-where-unique-without-author.input';
import { CommentThreadUpdateManyWithWhereWithoutAuthorInput } from './comment-thread-update-many-with-where-without-author.input';
import { CommentThreadScalarWhereInput } from './comment-thread-scalar-where.input';

@InputType()
export class CommentThreadUncheckedUpdateManyWithoutAuthorNestedInput {

    @Field(() => [CommentThreadCreateWithoutAuthorInput], {nullable:true})
    @Type(() => CommentThreadCreateWithoutAuthorInput)
    create?: Array<CommentThreadCreateWithoutAuthorInput>;

    @Field(() => [CommentThreadCreateOrConnectWithoutAuthorInput], {nullable:true})
    @Type(() => CommentThreadCreateOrConnectWithoutAuthorInput)
    connectOrCreate?: Array<CommentThreadCreateOrConnectWithoutAuthorInput>;

    @Field(() => [CommentThreadUpsertWithWhereUniqueWithoutAuthorInput], {nullable:true})
    @Type(() => CommentThreadUpsertWithWhereUniqueWithoutAuthorInput)
    upsert?: Array<CommentThreadUpsertWithWhereUniqueWithoutAuthorInput>;

    @Field(() => CommentThreadCreateManyAuthorInputEnvelope, {nullable:true})
    @Type(() => CommentThreadCreateManyAuthorInputEnvelope)
    createMany?: CommentThreadCreateManyAuthorInputEnvelope;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    set?: Array<CommentThreadWhereUniqueInput>;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    disconnect?: Array<CommentThreadWhereUniqueInput>;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    delete?: Array<CommentThreadWhereUniqueInput>;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    connect?: Array<CommentThreadWhereUniqueInput>;

    @Field(() => [CommentThreadUpdateWithWhereUniqueWithoutAuthorInput], {nullable:true})
    @Type(() => CommentThreadUpdateWithWhereUniqueWithoutAuthorInput)
    update?: Array<CommentThreadUpdateWithWhereUniqueWithoutAuthorInput>;

    @Field(() => [CommentThreadUpdateManyWithWhereWithoutAuthorInput], {nullable:true})
    @Type(() => CommentThreadUpdateManyWithWhereWithoutAuthorInput)
    updateMany?: Array<CommentThreadUpdateManyWithWhereWithoutAuthorInput>;

    @Field(() => [CommentThreadScalarWhereInput], {nullable:true})
    @Type(() => CommentThreadScalarWhereInput)
    deleteMany?: Array<CommentThreadScalarWhereInput>;
}
