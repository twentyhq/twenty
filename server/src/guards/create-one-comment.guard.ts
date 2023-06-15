import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class CreateOneCommentGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;
    const args = gqlContext.getArgs();

    const authorId = args.data?.author?.connect?.id;
    const commentThreadId = args.data?.commentThread?.connect?.id;

    if (!authorId || !commentThreadId) {
      throw new HttpException(
        { reason: 'Missing author or commentThread' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const author = await this.prismaService.user.findUnique({
      where: { id: authorId },
    });

    const commentThread = await this.prismaService.commentThread.findUnique({
      where: { id: commentThreadId },
    });

    if (!author || !commentThread) {
      throw new HttpException(
        { reason: 'Author or commentThread not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    const userWorkspaceMember =
      await this.prismaService.workspaceMember.findFirst({
        where: { userId: author.id },
      });

    if (!userWorkspaceMember) {
      throw new HttpException(
        { reason: 'Author or commentThread not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    const workspace = await request.workspace;

    if (
      userWorkspaceMember.workspaceId !== workspace.id ||
      commentThread.workspaceId !== workspace.id
    ) {
      throw new HttpException(
        { reason: 'Author or commentThread not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return true;
  }
}
