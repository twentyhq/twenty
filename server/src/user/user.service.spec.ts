import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { WorkspaceRepository } from './workspace.repository';
import { PrismaService } from '../database/prisma.service';
import {
  MockContext,
  createMockContext,
} from '../database/client-mock/context';
import { DeepMockProxy } from 'jest-mock-extended';

describe('UserService', () => {
  let mockCtx: MockContext;
  let service: UserService;
  let mockedPrismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    mockCtx = createMockContext();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        UserRepository,
        WorkspaceRepository,
        PrismaService,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockCtx.prisma)
      .compile();

    service = module.get<UserService>(UserService);
    mockedPrismaService =
      module.get<DeepMockProxy<PrismaService>>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('upsertWorkspaceMember should not upsert if email is absent', () => {
    service.handleUserCreated({
      event: {
        data: { new: { id: 1, email: ''}, old: null },
        session_variables: {},
        op: 'INSERT'
      },
      id: '1',
      table: { schema: 'auth', name: 'users' },
      trigger: { name: 'user-created' },
      delivery_info: { current_retry: 0, max_retries: 0},
      created_at: '2021-03-01T00:00:00.000Z',
    });
    expect(mockedPrismaService.workspace.findUnique).toHaveBeenCalledTimes(0);
  });

  it('upsertWorkspaceMember should upsert if domain name is found from email', async () => {
    mockedPrismaService.workspace.findUnique.mockResolvedValue({
      id: 2,
      display_name: 'test',
      domain_name: 'domain.namexxx',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    });

    mockedPrismaService.workspaceMember.upsert.mockResolvedValue({
      id: 1,
      user_id: '1',
      workspace_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    });

    await service.handleUserCreated({
      event: {
        data: { new: { id: 1, email: 'test@domain.name' }, old: null },
        session_variables: {},
        op: 'INSERT',
      },
      id: '1',
      table: { schema: 'auth', name: 'users' },
      trigger: { name: 'user-created' },
      delivery_info: { current_retry: 0, max_retries: 0 },
      created_at: '2021-03-01T00:00:00.000Z',
    });
    expect(mockedPrismaService.workspace.findUnique).toHaveBeenCalledWith({
      where: { domain_name: 'domain.name' },
    });
    expect(mockedPrismaService.workspaceMember.upsert).toHaveBeenCalledWith(
      {
        where: {
          user_id: '1',
        },
        create: {
          user_id: '1',
          workspace_id: 2,
        },
        update: {},
      },
    );
  });
});
