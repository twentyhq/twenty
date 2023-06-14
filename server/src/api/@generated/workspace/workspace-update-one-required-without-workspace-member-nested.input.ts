import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutWorkspaceMemberInput } from './workspace-create-without-workspace-member.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateOrConnectWithoutWorkspaceMemberInput } from './workspace-create-or-connect-without-workspace-member.input';
import { WorkspaceUpsertWithoutWorkspaceMemberInput } from './workspace-upsert-without-workspace-member.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { WorkspaceUpdateWithoutWorkspaceMemberInput } from './workspace-update-without-workspace-member.input';

@InputType()
export class WorkspaceUpdateOneRequiredWithoutWorkspaceMemberNestedInput {
  @Field(() => WorkspaceCreateWithoutWorkspaceMemberInput, { nullable: true })
  @Type(() => WorkspaceCreateWithoutWorkspaceMemberInput)
  create?: WorkspaceCreateWithoutWorkspaceMemberInput;

  @Field(() => WorkspaceCreateOrConnectWithoutWorkspaceMemberInput, {
    nullable: true,
  })
  @Type(() => WorkspaceCreateOrConnectWithoutWorkspaceMemberInput)
  connectOrCreate?: WorkspaceCreateOrConnectWithoutWorkspaceMemberInput;

  @Field(() => WorkspaceUpsertWithoutWorkspaceMemberInput, { nullable: true })
  @Type(() => WorkspaceUpsertWithoutWorkspaceMemberInput)
  upsert?: WorkspaceUpsertWithoutWorkspaceMemberInput;

  @Field(() => WorkspaceWhereUniqueInput, { nullable: true })
  @Type(() => WorkspaceWhereUniqueInput)
  connect?: WorkspaceWhereUniqueInput;

  @Field(() => WorkspaceUpdateWithoutWorkspaceMemberInput, { nullable: true })
  @Type(() => WorkspaceUpdateWithoutWorkspaceMemberInput)
  update?: WorkspaceUpdateWithoutWorkspaceMemberInput;
}
