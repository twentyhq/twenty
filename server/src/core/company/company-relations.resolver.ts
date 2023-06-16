import * as TypeGraphQL from '@nestjs/graphql';
import { CommentThread } from 'src/core/@generated/comment-thread/comment-thread.model';
import { Comment } from 'src/core/@generated/comment/comment.model';
import { Company } from 'src/core/@generated/company/company.model';
import { User } from 'src/core/@generated/user/user.model';
import { CompanyService } from './company.service';
import { CommentThreadService } from '../comment/services/comment-thread.service';
import { CommentService } from '../comment/services/comment.service';

@TypeGraphQL.Resolver(() => Company)
export class CompanyRelationsResolver {
  constructor(
    private readonly companyService: CompanyService,
    private readonly commentThreadService: CommentThreadService,
    private readonly commentService: CommentService,
  ) {}

  @TypeGraphQL.ResolveField(() => User, {
    nullable: true,
  })
  async accountOwner(
    @TypeGraphQL.Parent() company: Company,
  ): Promise<User | null> {
    return this.companyService
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
    return this.commentThreadService.findMany({
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

  @TypeGraphQL.ResolveField(() => [Comment], {
    nullable: false,
  })
  async comments(@TypeGraphQL.Root() company: Company): Promise<Comment[]> {
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
