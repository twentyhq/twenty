import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/modules/workspace/workspace.entity';
import { UserWorkspace } from 'src/engine/modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/modules/user/user.entity';
import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';
import { UserWorkspaceService } from 'src/engine/modules/user-workspace/user-workspace.service';
import { BillingService } from 'src/engine/modules/billing/billing.service';

import { WorkspaceService } from './workspace.service';

describe('WorkspaceService', () => {
  let service: WorkspaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {},
        },
        {
          provide: getRepositoryToken(UserWorkspace, 'core'),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User, 'core'),
          useValue: {},
        },
        {
          provide: WorkspaceManagerService,
          useValue: {},
        },
        {
          provide: UserWorkspaceService,
          useValue: {},
        },
        {
          provide: BillingService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
