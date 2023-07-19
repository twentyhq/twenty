import { Resolver, Root, ResolveField, Int } from '@nestjs/graphql';

import { CommentThread } from 'src/core/@generated/comment-thread/comment-thread.model';
import { Comment } from 'src/core/@generated/comment/comment.model';
import { Person } from 'src/core/@generated/person/person.model';
import { CommentThreadService } from 'src/core/comment/services/comment-thread.service';
import { CommentService } from 'src/core/comment/services/comment.service';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';

@Resolver(() => Person)
export class PersonRelationsResolver {
  constructor(
    private readonly commentThreadService: CommentThreadService,
    private readonly commentService: CommentService,
  ) {}

  @ResolveField(() => [CommentThread], {
    nullable: false,
  })
  async commentThreads(
    @Root() person: Person,
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

  @ResolveField(() => [Comment], {
    nullable: false,
  })
  async comments(
    @Root() person: Person,
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

  @ResolveField(() => Int, {
    nullable: false,
  })
  async _commentThreadCount(@Root() person: Person): Promise<number> {
    return this.commentThreadService.count({
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
