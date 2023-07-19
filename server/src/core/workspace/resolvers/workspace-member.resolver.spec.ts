import { Test, TestingModule } from '@nestjs/testing';

import { WorkspaceMemberService } from 'src/core/workspace/services/workspace-member.service';
import { AbilityFactory } from 'src/ability/ability.factory';

import { WorkspaceMemberResolver } from './workspace-member.resolver';

describe('WorkspaceMemberResolver', () => {
  let resolver: WorkspaceMemberResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceMemberResolver,
        {
          provide: WorkspaceMemberService,
          useValue: {},
        },
        {
          provide: AbilityFactory,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<WorkspaceMemberResolver>(WorkspaceMemberResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
