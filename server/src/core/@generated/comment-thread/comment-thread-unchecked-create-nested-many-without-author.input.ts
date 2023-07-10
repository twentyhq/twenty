import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutAuthorInput } from './comment-thread-create-without-author.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateOrConnectWithoutAuthorInput } from './comment-thread-create-or-connect-without-author.input';
import { CommentThreadCreateManyAuthorInputEnvelope } from './comment-thread-create-many-author-input-envelope.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';

@InputType()
export class CommentThreadUncheckedCreateNestedManyWithoutAuthorInput {

    @Field(() => [CommentThreadCreateWithoutAuthorInput], {nullable:true})
    @Type(() => CommentThreadCreateWithoutAuthorInput)
    create?: Array<CommentThreadCreateWithoutAuthorInput>;

    @Field(() => [CommentThreadCreateOrConnectWithoutAuthorInput], {nullable:true})
    @Type(() => CommentThreadCreateOrConnectWithoutAuthorInput)
    connectOrCreate?: Array<CommentThreadCreateOrConnectWithoutAuthorInput>;

    @Field(() => CommentThreadCreateManyAuthorInputEnvelope, {nullable:true})
    @Type(() => CommentThreadCreateManyAuthorInputEnvelope)
    createMany?: CommentThreadCreateManyAuthorInputEnvelope;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    connect?: Array<CommentThreadWhereUniqueInput>;
}
