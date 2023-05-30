import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/database/prisma.service';
import { JwtPayload } from '../strategies/jwt.auth.strategy';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = this.prismaService.user.findUniqueOrThrow({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new HttpException(
          { reason: 'User does not exist' },
          HttpStatus.FORBIDDEN,
        );
      }

      const workspace = this.prismaService.workspace.findUniqueOrThrow({
        where: { id: payload.workspaceId },
      });

      if (!workspace) {
        throw new HttpException(
          { reason: 'Workspace does not exist' },
          HttpStatus.FORBIDDEN,
        );
      }

      request.user = user;
      request.workspace = workspace;
    } catch (exception) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
