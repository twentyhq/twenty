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
export class CreateOneCommentThreadGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    // TODO: type request
    const request = gqlContext.getContext().req;
    const args = gqlContext.getArgs();

    const targets = args.data?.commentThreadTargets?.createMany?.data;
    const comments = args.data?.comments?.createMany?.data;
    const workspace = await request.workspace;

    if (!targets || targets.length === 0) {
      throw new HttpException(
        { reason: 'Missing commentThreadTargets' },
        HttpStatus.BAD_REQUEST,
      );
    }

    await targets.map(async (target) => {
      if (!target.commentableId || !target.commentableType) {
        throw new HttpException(
          {
            reason:
              'Missing commentThreadTarget.commentableId or commentThreadTarget.commentableType',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!['Person', 'Company'].includes(target.commentableType)) {
        throw new HttpException(
          { reason: 'Invalid commentThreadTarget.commentableType' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const targetEntity = await this.prismaService[
        target.commentableType
      ].findUnique({
        where: { id: target.commentableId },
      });

      if (!targetEntity || targetEntity.workspaceId !== workspace.id) {
        throw new HttpException(
          { reason: 'CommentThreadTarget not found' },
          HttpStatus.NOT_FOUND,
        );
      }
    });

    if (!comments) {
      return true;
    }

    await comments.map(async (comment) => {
      if (!comment.authorId) {
        throw new HttpException(
          { reason: 'Missing comment.authorId' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const author = await this.prismaService.user.findUnique({
        where: { id: comment.authorId },
      });

      if (!author) {
        throw new HttpException(
          { reason: 'Comment.authorId not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      const userWorkspaceMember =
        await this.prismaService.workspaceMember.findFirst({
          where: { userId: author.id },
        });

      console.log({ userWorkspaceMember, workspace, author });

      if (
        !userWorkspaceMember ||
        userWorkspaceMember.workspaceId !== workspace.id
      ) {
        throw new HttpException(
          { reason: 'userWorkspaceMember.workspaceId not found' },
          HttpStatus.NOT_FOUND,
        );
      }
    });

    return true;
  }
}
