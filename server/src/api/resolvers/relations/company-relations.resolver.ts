import * as TypeGraphQL from '@nestjs/graphql';
import { CommentThread } from 'src/api/@generated/comment-thread/comment-thread.model';
import { Company } from 'src/api/@generated/company/company.model';
import { User } from 'src/api/@generated/user/user.model';
import { PrismaService } from 'src/database/prisma.service';

@TypeGraphQL.Resolver(() => Company)
export class CompanyRelationsResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @TypeGraphQL.ResolveField(() => User, {
    nullable: true,
  })
  async accountOwner(
    @TypeGraphQL.Parent() company: Company,
  ): Promise<User | null> {
    return this.prismaService.company
      .findUniqueOrThrow({
        where: {
          id: company.id,
        },
      })
      .accountOwner({});
  }

  @TypeGraphQL.ResolveField(() => [CommentThread], {
    nullable: false,
  })
  async commentThreads(
    @TypeGraphQL.Root() company: Company,
  ): Promise<CommentThread[]> {
    return this.prismaService.commentThread.findMany({
      where: {
        commentThreadTargets: {
          some: {
            commentableId: company.id,
            commentableType: 'Company',
          },
        },
      },
    });
  }
}
