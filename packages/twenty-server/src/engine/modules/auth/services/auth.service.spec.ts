import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UserService } from 'src/engine/modules/user/services/user.service';
import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';
import { Workspace } from 'src/engine/modules/workspace/workspace.entity';
import { User } from 'src/engine/modules/user/user.entity';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { EmailService } from 'src/engine/integrations/email/email.service';
import { SignUpService } from 'src/engine/modules/auth/services/sign-up.service';

import { AuthService } from './auth.service';
import { TokenService } from './token.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: TokenService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: SignUpService,
          useValue: {},
        },
        {
          provide: WorkspaceManagerService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User, 'core'),
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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
