import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { RefreshToken } from 'src/engine/modules/refresh-token/refresh-token.entity';
import { User } from 'src/engine/modules/user/user.entity';
import { JwtAuthStrategy } from 'src/engine/modules/auth/strategies/jwt.auth.strategy';
import { EmailService } from 'src/integrations/email/email.service';
import { UserWorkspaceService } from 'src/engine/modules/user-workspace/user-workspace.service';
import { Workspace } from 'src/engine/modules/workspace/workspace.entity';

import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: JwtAuthStrategy,
          useValue: {},
        },
        {
          provide: EnvironmentService,
          useValue: {},
        },
        {
          provide: EmailService,
          useValue: {},
        },
        {
          provide: UserWorkspaceService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(User, 'core'),
          useValue: {},
        },
        {
          provide: getRepositoryToken(RefreshToken, 'core'),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
