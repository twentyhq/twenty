import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceMemberRelationsResolver } from './workspace-member-relations.resolver';
import { WorkspaceMemberService } from '../services/workspace-member.service';

describe('WorkspaceMemberRelationsResolver', () => {
  let resolver: WorkspaceMemberRelationsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceMemberRelationsResolver,
        {
          provide: WorkspaceMemberService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<WorkspaceMemberRelationsResolver>(
      WorkspaceMemberRelationsResolver,
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
