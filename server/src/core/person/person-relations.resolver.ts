import * as TypeGraphQL from '@nestjs/graphql';
import { CommentThread } from 'src/core/@generated/comment-thread/comment-thread.model';
import { Comment } from 'src/core/@generated/comment/comment.model';
import { Company } from 'src/core/@generated/company/company.model';
import { Person } from 'src/core/@generated/person/person.model';
import { PersonService } from './person.service';
import { CommentThreadService } from '../comment/services/comment-thread.service';
import { CommentService } from '../comment/services/comment.service';

@TypeGraphQL.Resolver(() => Person)
export class PersonRelationsResolver {
  constructor(
    private readonly personService: PersonService,
    private readonly commentThreadService: CommentThreadService,
    private readonly commentService: CommentService,
  ) {}

  @TypeGraphQL.ResolveField(() => Company, {
    nullable: true,
  })
  async company(@TypeGraphQL.Parent() person: Person): Promise<Company | null> {
    return await this.personService
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
    return await this.commentThreadService.findMany({
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
