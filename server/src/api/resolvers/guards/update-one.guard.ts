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
export class UpdateOneGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;
    const entity = gqlContext.getArgByIndex(3).returnType?.name;
    const args = gqlContext.getArgs();

    if (!entity || !args.where?.id) {
      throw new HttpException(
        { reason: 'Invalid Request' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const object = await this.prismaService[entity].findUniqueOrThrow({
      where: { id: args.where.id },
    });

    if (!object) {
      throw new HttpException(
        { reason: 'Record not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    const workspace = await request.workspace;

    if (object.workspaceId !== workspace.id) {
      throw new HttpException(
        { reason: 'Record not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    return true;
  }
}
