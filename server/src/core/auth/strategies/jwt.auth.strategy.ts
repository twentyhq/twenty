import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { Strategy, ExtractJwt } from 'passport-jwt';
import { User, Workspace } from '@prisma/client';

import { PrismaService } from 'src/database/prisma.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

export type JwtPayload = { sub: string; workspaceId: string };
export type PassportUser = { user: User; workspace: Workspace };

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: environmentService.getAccessTokenSecret(),
    });
  }

  async validate(payload: JwtPayload): Promise<{ workspace: Workspace }> {
    const workspaceFromJWT =
      await this.prismaService.client.workspace.findUnique({
        where: { id: payload.sub },
      });
    if (workspaceFromJWT) {
      return { workspace: workspaceFromJWT };
    }

    const user = await this.prismaService.client.user.findUniqueOrThrow({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const workspace =
      await this.prismaService.client.workspace.findUniqueOrThrow({
        where: { id: payload.workspaceId },
      });

    if (!workspace) {
      throw new UnauthorizedException();
    }

    return { workspace };
  }
}
