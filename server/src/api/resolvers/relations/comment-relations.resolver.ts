import * as TypeGraphQL from '@nestjs/graphql';
import { PrismaService } from 'src/database/prisma.service';
import { User } from 'src/api/@generated/user/user.model';
import { Comment } from 'src/api/@generated/comment/comment.model';

@TypeGraphQL.Resolver(() => Comment)
export class CommentRelationsResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @TypeGraphQL.ResolveField(() => User, {
    nullable: true,
  })
  async author(@TypeGraphQL.Parent() comment: Comment): Promise<User | null> {
    return await this.prismaService.comment
      .findFirst({
        where: {
          id: comment.id,
        },
      })
      .author({});
  }
}
