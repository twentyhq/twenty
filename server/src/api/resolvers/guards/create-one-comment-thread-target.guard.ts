import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CreateOneCommentThreadTargetArgs } from 'src/api/@generated/comment-thread-target/create-one-comment-thread-target.args';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class CreateOneCommentThreadTargetGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);

    const args = gqlContext.getArgs() as CreateOneCommentThreadTargetArgs;

    if (!args.data.commentThread.connect?.id) {
      throw new HttpException(
        { reason: 'Missing commentThread id' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return true;
  }
}
