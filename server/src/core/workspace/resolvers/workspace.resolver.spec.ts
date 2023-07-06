import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceResolver } from './workspace.resolver';
import { WorkspaceService } from '../services/workspace.service';

describe('WorkspaceMemberResolver', () => {
  let resolver: WorkspaceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceResolver,
        { provide: WorkspaceService, useValue: {} },
      ],
    }).compile();

    resolver = module.get<WorkspaceResolver>(WorkspaceResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
