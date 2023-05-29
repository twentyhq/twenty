import * as TypeGraphQL from '@nestjs/graphql';
import { User } from 'src/api/@generated/user/user.model';
import { WorkspaceMember } from 'src/api/@generated/workspace-member/workspace-member.model';
import { Workspace } from 'src/api/@generated/workspace/workspace.model';
import { PrismaService } from 'src/database/prisma.service';

@TypeGraphQL.Resolver(() => WorkspaceMember)
export class WorkspaceMemberRelationsResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @TypeGraphQL.ResolveField(() => User, {
    nullable: false,
  })
  async user(
    @TypeGraphQL.Parent() workspaceMember: WorkspaceMember,
  ): Promise<User> {
    return await this.prismaService.workspaceMember
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
    return this.prismaService.workspaceMember
      .findUniqueOrThrow({
        where: {
          id: workspaceMember.id,
        },
      })
      .workspace({});
  }
}
