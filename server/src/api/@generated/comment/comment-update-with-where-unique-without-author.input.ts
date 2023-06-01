import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { Type } from 'class-transformer';
import { CommentUpdateWithoutAuthorInput } from './comment-update-without-author.input';

@InputType()
export class CommentUpdateWithWhereUniqueWithoutAuthorInput {
  @Field(() => CommentWhereUniqueInput, { nullable: false })
  @Type(() => CommentWhereUniqueInput)
  where!: CommentWhereUniqueInput;

  @Field(() => CommentUpdateWithoutAuthorInput, { nullable: false })
  @Type(() => CommentUpdateWithoutAuthorInput)
  data!: CommentUpdateWithoutAuthorInput;
}
