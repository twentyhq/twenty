import * as TypeGraphQL from '@nestjs/graphql';
import { User } from 'src/core/@generated/user/user.model';
import { WorkspaceMember } from 'src/core/@generated/workspace-member/workspace-member.model';
import { Workspace } from 'src/core/@generated/workspace/workspace.model';
import { WorkspaceMemberService } from '../services/workspace-member.service';

@TypeGraphQL.Resolver(() => WorkspaceMember)
export class WorkspaceMemberRelationsResolver {
  constructor(
    private readonly workspaceMemberSercice: WorkspaceMemberService,
  ) {}

  @TypeGraphQL.ResolveField(() => User, {
    nullable: false,
  })
  async user(
    @TypeGraphQL.Parent() workspaceMember: WorkspaceMember,
  ): Promise<User> {
    return await this.workspaceMemberSercice
      .findUniqueOrThrow({
        where: {
          id: workspaceMember.id,
        },
      })
      .user({});
  }

  @TypeGraphQL.ResolveField(() => Workspace, {
    nullable: false,
  })
  async workspace(
    @TypeGraphQL.Parent() workspaceMember: WorkspaceMember,
  ): Promise<Workspace> {
    return this.workspaceMemberSercice
      .findUniqueOrThrow({
        where: {
          id: workspaceMember.id,
        },
      })
      .workspace({});
  }
}
