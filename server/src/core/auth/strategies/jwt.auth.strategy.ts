import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/database/prisma.service';
import { User, Workspace } from '@prisma/client';

export type JwtPayload = { userId: string; workspaceId: string };
export type PassportUser = { user: User; workspace: Workspace };

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<PassportUser> {
    const user = await this.prismaService.user.findUniqueOrThrow({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const workspace = await this.prismaService.workspace.findUniqueOrThrow({
      where: { id: payload.workspaceId },
    });

    if (!workspace) {
      throw new UnauthorizedException();
    }

    return { user, workspace };
  }
}
