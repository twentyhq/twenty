import * as TypeGraphQL from '@nestjs/graphql';
import type { GraphQLResolveInfo } from 'graphql';
import { WorkspaceMember } from 'src/core/@generated/workspace-member/workspace-member.model';
import { User } from 'src/core/@generated/user/user.model';
import { Company } from 'src/core/@generated/company/company.model';
import { FindManyCompanyArgs } from 'src/core/@generated/company/find-many-company.args';
import { UserService } from './user.service';

@TypeGraphQL.Resolver(() => User)
export class UserRelationsResolver {
  constructor(private readonly userService: UserService) {}

  @TypeGraphQL.ResolveField(() => WorkspaceMember, {
    nullable: true,
  })
  async workspaceMember(
    @TypeGraphQL.Parent() user: User,
  ): Promise<WorkspaceMember | null> {
    return await this.userService
      .findFirst({
        where: {
          id: user.id,
        },
      })
      .workspaceMember({});
  }

  @TypeGraphQL.ResolveField(() => [Company], {
    nullable: false,
  })
  async companies(
    @TypeGraphQL.Parent() user: User,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindManyCompanyArgs,
  ): Promise<Company[]> {
    return this.userService
      .findUniqueOrThrow({
        where: {
          id: user.id,
        },
      })
      .companies({
        ...args,
      });
  }
}
