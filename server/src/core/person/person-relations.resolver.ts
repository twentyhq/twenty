import * as TypeGraphQL from '@nestjs/graphql';
import { CommentThread } from 'src/core/@generated/comment-thread/comment-thread.model';
import { Comment } from 'src/core/@generated/comment/comment.model';
import { Person } from 'src/core/@generated/person/person.model';
import { CommentThreadService } from '../comment/services/comment-thread.service';
import { CommentService } from '../comment/services/comment.service';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';

@TypeGraphQL.Resolver(() => Person)
export class PersonRelationsResolver {
  constructor(
    private readonly commentThreadService: CommentThreadService,
    private readonly commentService: CommentService,
  ) {}

  @TypeGraphQL.ResolveField(() => [CommentThread], {
    nullable: false,
  })
  async commentThreads(
    @TypeGraphQL.Root() person: Person,
    @PrismaSelector({ modelName: 'CommentThread' })
    prismaSelect: PrismaSelect<'CommentThread'>,
  ): Promise<Partial<CommentThread>[]> {
    return await this.commentThreadService.findMany({
      where: {
        commentThreadTargets: {
          some: {
            commentableId: person.id,
            commentableType: 'Person',
          },
        },
      },
      select: prismaSelect.value,
    });
  }

  @TypeGraphQL.ResolveField(() => [Comment], {
    nullable: false,
  })
  async comments(
    @TypeGraphQL.Root() person: Person,
    @PrismaSelector({ modelName: 'Comment' })
    prismaSelect: PrismaSelect<'Comment'>,
  ): Promise<Partial<Comment>[]> {
    return this.commentService.findMany({
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
      select: prismaSelect.value,
    });
  }

  @TypeGraphQL.ResolveField(() => TypeGraphQL.Int, {
    nullable: false,
  })
  async _commentCount(@TypeGraphQL.Root() person: Person): Promise<number> {
    return this.commentService.count({
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
