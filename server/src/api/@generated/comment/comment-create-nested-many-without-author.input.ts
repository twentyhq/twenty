import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentCreateWithoutAuthorInput } from './comment-create-without-author.input';
import { Type } from 'class-transformer';
import { CommentCreateOrConnectWithoutAuthorInput } from './comment-create-or-connect-without-author.input';
import { CommentCreateManyAuthorInputEnvelope } from './comment-create-many-author-input-envelope.input';
import { CommentWhereUniqueInput } from './comment-where-unique.input';

@InputType()
export class CommentCreateNestedManyWithoutAuthorInput {
  @Field(() => [CommentCreateWithoutAuthorInput], { nullable: true })
  @Type(() => CommentCreateWithoutAuthorInput)
  create?: Array<CommentCreateWithoutAuthorInput>;

  @Field(() => [CommentCreateOrConnectWithoutAuthorInput], { nullable: true })
  @Type(() => CommentCreateOrConnectWithoutAuthorInput)
  connectOrCreate?: Array<CommentCreateOrConnectWithoutAuthorInput>;

  @Field(() => CommentCreateManyAuthorInputEnvelope, { nullable: true })
  @Type(() => CommentCreateManyAuthorInputEnvelope)
  createMany?: CommentCreateManyAuthorInputEnvelope;

  @Field(() => [CommentWhereUniqueInput], { nullable: true })
  @Type(() => CommentWhereUniqueInput)
  connect?: Array<CommentWhereUniqueInput>;
}
