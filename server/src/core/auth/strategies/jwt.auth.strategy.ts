import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Strategy, ExtractJwt } from 'passport-jwt';
import { Repository } from 'typeorm';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { User } from 'src/core/user/user.entity';

export type JwtPayload = { sub: string; workspaceId: string; jti?: string };
export type PassportUser = { user?: User; workspace: Workspace };

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly environmentService: EnvironmentService,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: environmentService.getAccessTokenSecret(),
    });
  }

  async validate(payload: JwtPayload): Promise<PassportUser> {
    const workspace = await this.workspaceRepository.findOneBy({
      id: payload.workspaceId ?? payload.sub,
    });
    if (!workspace) {
      throw new UnauthorizedException();
    }
    if (payload.jti) {
      // If apiKey has been deleted or revoked, we throw an error
      // const apiKey = await this.prismaService.client.apiKey.findUniqueOrThrow({
      //   where: { id: payload.jti },
      // });
      // assert(!apiKey.revokedAt, 'This API Key is revoked', ForbiddenException);
    }

    const user = payload.workspaceId
      ? await this.userRepository.findOneBy({
          id: payload.sub,
        })
      : undefined;

    if (!user) {
      throw new UnauthorizedException();
    }

    return { user, workspace };
  }
}
