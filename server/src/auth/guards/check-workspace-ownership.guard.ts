import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma.service';

type OperationEntity = {
  operation?: string;
  entity?: string;
};

@Injectable()
export class CheckWorkspaceOwnership implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    const { operation, entity } = this.fetchOperationAndEntity(request);
    const variables = request.body.variables;
    const workspace = await request.workspace;

    if (!entity || !operation) {
      return false;
    }

    if (operation === 'updateOne') {
      const object = await this.prismaService[entity].findUniqueOrThrow({
        where: { id: variables.id },
      });

      if (!object) {
        throw new HttpException(
          { reason: 'Record not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      if (object.workspaceId !== workspace.id) {
        throw new HttpException(
          { reason: 'Record not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      return true;
    }

    if (operation === 'deleteMany') {
      // TODO: write this logic
      return true;
    }

    if (operation === 'findMany') {
      return true;
    }

    if (operation === 'createOne') {
      return true;
    }

    return false;
  }

  private fetchOperationAndEntity(request: Request): OperationEntity {
    if (!request.body.operationName) {
      return { operation: undefined, entity: undefined };
    }

    const regex =
      /(updateOne|deleteMany|createOne|findMany)(Person|Company|User)/i;
    const match = request.body.query.match(regex);
    if (match) {
      return {
        operation: match[1],
        entity: match[2].toLowerCase(),
      };
    }
    return { operation: undefined, entity: undefined };
  }
}
