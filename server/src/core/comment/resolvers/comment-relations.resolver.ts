import * as TypeGraphQL from '@nestjs/graphql';
import { User } from 'src/core/@generated/user/user.model';
import { Comment } from 'src/core/@generated/comment/comment.model';
import { CommentService } from '../services/comment.service';

@TypeGraphQL.Resolver(() => Comment)
export class CommentRelationsResolver {
  constructor(private readonly commentService: CommentService) {}

  @TypeGraphQL.ResolveField(() => User, {
    nullable: true,
  })
  async author(@TypeGraphQL.Parent() comment: Comment): Promise<User | null> {
    return await this.commentService
      .findFirst({
        where: {
          id: comment.id,
        },
      })
      .author({});
  }
}
