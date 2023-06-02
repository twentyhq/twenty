import * as TypeGraphQL from '@nestjs/graphql';
import { CommentThread } from 'src/api/@generated/comment-thread/comment-thread.model';
import { Comment } from 'src/api/@generated/comment/comment.model';
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

  @TypeGraphQL.ResolveField(() => [Comment], {
    nullable: false,
  })
  async comments(@TypeGraphQL.Root() person: Person): Promise<Comment[]> {
    return this.prismaService.comment.findMany({
      where: {
        commentThread: {
          commentThreadTargets: {
            some: {
              commentableId: person.id,
              commentableType: 'Person',
            },
          },
        },
      },
    });
  }

  @TypeGraphQL.ResolveField(() => TypeGraphQL.Int, {
    nullable: false,
  })
  async _commentCount(@TypeGraphQL.Root() person: Person): Promise<number> {
    return this.prismaService.comment.count({
      where: {
        commentThread: {
          commentThreadTargets: {
            some: {
              commentableId: person.id,
              commentableType: 'Person',
            },
          },
        },
      },
    });
  }
}
