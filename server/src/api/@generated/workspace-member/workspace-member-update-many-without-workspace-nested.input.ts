import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceMemberCreateWithoutWorkspaceInput } from './workspace-member-create-without-workspace.input';
import { Type } from 'class-transformer';
import { WorkspaceMemberCreateOrConnectWithoutWorkspaceInput } from './workspace-member-create-or-connect-without-workspace.input';
import { WorkspaceMemberUpsertWithWhereUniqueWithoutWorkspaceInput } from './workspace-member-upsert-with-where-unique-without-workspace.input';
import { WorkspaceMemberCreateManyWorkspaceInputEnvelope } from './workspace-member-create-many-workspace-input-envelope.input';
import { WorkspaceMemberWhereUniqueInput } from './workspace-member-where-unique.input';
import { WorkspaceMemberUpdateWithWhereUniqueWithoutWorkspaceInput } from './workspace-member-update-with-where-unique-without-workspace.input';
import { WorkspaceMemberUpdateManyWithWhereWithoutWorkspaceInput } from './workspace-member-update-many-with-where-without-workspace.input';
import { WorkspaceMemberScalarWhereInput } from './workspace-member-scalar-where.input';

@InputType()
export class WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput {
  @Field(() => [WorkspaceMemberCreateWithoutWorkspaceInput], { nullable: true })
  @Type(() => WorkspaceMemberCreateWithoutWorkspaceInput)
  create?: Array<WorkspaceMemberCreateWithoutWorkspaceInput>;

  @Field(() => [WorkspaceMemberCreateOrConnectWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => WorkspaceMemberCreateOrConnectWithoutWorkspaceInput)
  connectOrCreate?: Array<WorkspaceMemberCreateOrConnectWithoutWorkspaceInput>;

  @Field(() => [WorkspaceMemberUpsertWithWhereUniqueWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => WorkspaceMemberUpsertWithWhereUniqueWithoutWorkspaceInput)
  upsert?: Array<WorkspaceMemberUpsertWithWhereUniqueWithoutWorkspaceInput>;

  @Field(() => WorkspaceMemberCreateManyWorkspaceInputEnvelope, {
    nullable: true,
  })
  @Type(() => WorkspaceMemberCreateManyWorkspaceInputEnvelope)
  createMany?: WorkspaceMemberCreateManyWorkspaceInputEnvelope;

  @Field(() => [WorkspaceMemberWhereUniqueInput], { nullable: true })
  @Type(() => WorkspaceMemberWhereUniqueInput)
  set?: Array<WorkspaceMemberWhereUniqueInput>;

  @Field(() => [WorkspaceMemberWhereUniqueInput], { nullable: true })
  @Type(() => WorkspaceMemberWhereUniqueInput)
  disconnect?: Array<WorkspaceMemberWhereUniqueInput>;

  @Field(() => [WorkspaceMemberWhereUniqueInput], { nullable: true })
  @Type(() => WorkspaceMemberWhereUniqueInput)
  delete?: Array<WorkspaceMemberWhereUniqueInput>;

  @Field(() => [WorkspaceMemberWhereUniqueInput], { nullable: true })
  @Type(() => WorkspaceMemberWhereUniqueInput)
  connect?: Array<WorkspaceMemberWhereUniqueInput>;

  @Field(() => [WorkspaceMemberUpdateWithWhereUniqueWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => WorkspaceMemberUpdateWithWhereUniqueWithoutWorkspaceInput)
  update?: Array<WorkspaceMemberUpdateWithWhereUniqueWithoutWorkspaceInput>;

  @Field(() => [WorkspaceMemberUpdateManyWithWhereWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => WorkspaceMemberUpdateManyWithWhereWithoutWorkspaceInput)
  updateMany?: Array<WorkspaceMemberUpdateManyWithWhereWithoutWorkspaceInput>;

  @Field(() => [WorkspaceMemberScalarWhereInput], { nullable: true })
  @Type(() => WorkspaceMemberScalarWhereInput)
  deleteMany?: Array<WorkspaceMemberScalarWhereInput>;
}
