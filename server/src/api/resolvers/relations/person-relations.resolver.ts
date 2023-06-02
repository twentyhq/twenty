import * as TypeGraphQL from '@nestjs/graphql';
import { CommentThread } from 'src/api/@generated/comment-thread/comment-thread.model';
import { Company } from 'src/api/@generated/company/company.model';
import { Person } from 'src/api/@generated/person/person.model';
import { PrismaService } from 'src/database/prisma.service';

@TypeGraphQL.Resolver(() => Person)
export class PersonRelationsResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @TypeGraphQL.ResolveField(() => Company, {
    nullable: true,
  })
  async company(@TypeGraphQL.Parent() person: Person): Promise<Company | null> {
    return await this.prismaService.person
      .findUniqueOrThrow({
        where: {
          id: person.id,
        },
      })
      .company({});
  }

  @TypeGraphQL.ResolveField(() => [CommentThread], {
    nullable: false,
  })
  async commentThreads(
    @TypeGraphQL.Root() person: Person,
  ): Promise<CommentThread[]> {
    return await this.prismaService.commentThread.findMany({
      where: {
        commentThreadTargets: {
          some: {
            commentableId: person.id,
            commentableType: 'Person',
          },
        },
      },
    });
  }
}
