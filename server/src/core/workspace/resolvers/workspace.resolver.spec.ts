import { Test, TestingModule } from '@nestjs/testing';

import { WorkspaceService } from 'src/core/workspace/services/workspace.service';
import { FileUploadService } from 'src/core/file/services/file-upload.service';
import { AbilityFactory } from 'src/ability/ability.factory';

import { WorkspaceResolver } from './workspace.resolver';

describe('WorkspaceResolver', () => {
  let resolver: WorkspaceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceResolver,
        { provide: WorkspaceService, useValue: {} },
        { provide: AbilityFactory, useValue: {} },
        { provide: FileUploadService, useValue: {} },
      ],
    }).compile();

    resolver = module.get<WorkspaceResolver>(WorkspaceResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
