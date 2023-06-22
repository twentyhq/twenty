import * as TypeGraphQL from '@nestjs/graphql';
import { CommentThread } from 'src/core/@generated/comment-thread/comment-thread.model';
import { Comment } from 'src/core/@generated/comment/comment.model';
import { Company } from 'src/core/@generated/company/company.model';
import { CommentThreadService } from '../comment/services/comment-thread.service';
import { CommentService } from '../comment/services/comment.service';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';

@TypeGraphQL.Resolver(() => Company)
export class CompanyRelationsResolver {
  constructor(
    private readonly commentThreadService: CommentThreadService,
    private readonly commentService: CommentService,
  ) {}

  @TypeGraphQL.ResolveField(() => [CommentThread], {
    nullable: false,
  })
  async commentThreads(
    @TypeGraphQL.Root() company: Company,
    @PrismaSelector({ modelName: 'CommentThread' })
    prismaSelect: PrismaSelect<'CommentThread'>,
  ): Promise<Partial<CommentThread>[]> {
    return this.commentThreadService.findMany({
      where: {
        commentThreadTargets: {
          some: {
            commentableId: company.id,
            commentableType: 'Company',
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
    @TypeGraphQL.Root() company: Company,
    @PrismaSelector({ modelName: 'Comment' })
    prismaSelect: PrismaSelect<'Comment'>,
  ): Promise<Partial<Comment>[]> {
    return this.commentService.findMany({
      where: {
        commentThread: {
          commentThreadTargets: {
            some: {
              commentableId: company.id,
              commentableType: 'Company',
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
  async _commentCount(@TypeGraphQL.Root() company: Company): Promise<number> {
    return this.commentService.count({
      where: {
        commentThread: {
          commentThreadTargets: {
            some: {
              commentableId: company.id,
              commentableType: 'Company',
            },
          },
        },
      },
    });
  }
}
