import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutCommentThreadsInput } from './workspace-create-without-comment-threads.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateOrConnectWithoutCommentThreadsInput } from './workspace-create-or-connect-without-comment-threads.input';
import { WorkspaceUpsertWithoutCommentThreadsInput } from './workspace-upsert-without-comment-threads.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { WorkspaceUpdateWithoutCommentThreadsInput } from './workspace-update-without-comment-threads.input';

@InputType()
export class WorkspaceUpdateOneRequiredWithoutCommentThreadsNestedInput {
  @Field(() => WorkspaceCreateWithoutCommentThreadsInput, { nullable: true })
  @Type(() => WorkspaceCreateWithoutCommentThreadsInput)
  create?: WorkspaceCreateWithoutCommentThreadsInput;

  @Field(() => WorkspaceCreateOrConnectWithoutCommentThreadsInput, {
    nullable: true,
  })
  @Type(() => WorkspaceCreateOrConnectWithoutCommentThreadsInput)
  connectOrCreate?: WorkspaceCreateOrConnectWithoutCommentThreadsInput;

  @Field(() => WorkspaceUpsertWithoutCommentThreadsInput, { nullable: true })
  @Type(() => WorkspaceUpsertWithoutCommentThreadsInput)
  upsert?: WorkspaceUpsertWithoutCommentThreadsInput;

  @Field(() => WorkspaceWhereUniqueInput, { nullable: true })
  @Type(() => WorkspaceWhereUniqueInput)
  connect?: WorkspaceWhereUniqueInput;

  @Field(() => WorkspaceUpdateWithoutCommentThreadsInput, { nullable: true })
  @Type(() => WorkspaceUpdateWithoutCommentThreadsInput)
  update?: WorkspaceUpdateWithoutCommentThreadsInput;
}
