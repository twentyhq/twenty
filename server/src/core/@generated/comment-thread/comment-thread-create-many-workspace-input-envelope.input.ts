import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateManyWorkspaceInput } from './comment-thread-create-many-workspace.input';
import { Type } from 'class-transformer';

@InputType()
export class CommentThreadCreateManyWorkspaceInputEnvelope {
  @Field(() => [CommentThreadCreateManyWorkspaceInput], { nullable: false })
  @Type(() => CommentThreadCreateManyWorkspaceInput)
  data!: Array<CommentThreadCreateManyWorkspaceInput>;

  @Field(() => Boolean, { nullable: true })
  skipDuplicates?: boolean;
}
