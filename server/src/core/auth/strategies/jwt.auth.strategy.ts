import { PassportStrategy } from '@nestjs/passport';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Strategy, ExtractJwt } from 'passport-jwt';
import { User, Workspace } from '@prisma/client';

import { PrismaService } from 'src/database/prisma.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { assert } from 'src/utils/assert';

export type JwtPayload = { sub: string; workspaceId: string; jti?: string };
export type PassportUser = { user?: User; workspace: Workspace };

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

  async validate(payload: JwtPayload): Promise<PassportUser> {
    const workspace = await this.prismaService.client.workspace.findUnique({
      where: { id: payload.workspaceId ?? payload.sub },
    });
    if (!workspace) {
      throw new UnauthorizedException();
    }
    if (payload.jti) {
      // If apiKey has been deleted or revoked, we throw an error
      const apiKey = await this.prismaService.client.apiKey.findUniqueOrThrow({
        where: { id: payload.jti },
      });
      assert(!apiKey.revokedAt, 'This API Key is revoked', ForbiddenException);
    }

    const user = payload.workspaceId
      ? await this.prismaService.client.user.findUniqueOrThrow({
          where: { id: payload.sub },
        })
      : undefined;

    return { user, workspace };
  }
}
