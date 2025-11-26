import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AiAgentRoleService } from 'src/engine/metadata-modules/ai-agent-role/ai-agent-role.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai-chat/services/agent-chat.service';
import { AgentEntity } from 'src/engine/metadata-modules/ai-agent/entities/agent.entity';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai-agent/agent.exception';
import { AgentResolver } from 'src/engine/metadata-modules/ai-agent/agent.resolver';
import { AgentService } from 'src/engine/metadata-modules/ai-agent/agent.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';

// Mock the agent service
jest.mock('../../../../../src/engine/metadata-modules/ai-agent/agent.service');

// Mock the guards and decorators
jest.mock('../../../../../src/engine/guards/feature-flag.guard', () => ({
  FeatureFlagGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
  RequireFeatureFlag: () => jest.fn(),
}));

jest.mock('../../../../../src/engine/guards/workspace-auth.guard', () => ({
  WorkspaceAuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('agentResolver', () => {
  let agentService: AgentService;
  let agentResolver: AgentResolver;
  let module: TestingModule;

  beforeAll(async () => {
    // Create a testing module with mocked dependencies
    module = await Test.createTestingModule({
      providers: [
        AgentResolver,
        {
          provide: AgentService,
          useValue: {
            findOneAgent: jest.fn(),
            updateOneAgent: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AgentEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RoleTargetsEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: AgentChatService,
          useValue: {
            createThread: jest.fn(),
          },
        },
        {
          provide: AiAgentRoleService,
          useValue: {
            assignRoleToAgent: jest.fn(),
            removeRoleFromAgent: jest.fn(),
          },
        },
        {
          provide: PermissionsService,
          useValue: {
            userHasWorkspaceSettingPermission: jest
              .fn()
              .mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    // Get the mocked services from the module
    agentService = module.get<AgentService>(AgentService);
    agentResolver = module.get<AgentResolver>(AgentResolver);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('findOneAgent', () => {
    const testAgentId = 'test-agent-id';
    const workspaceId = 'test-workspace-id';
    const mockAgent = {
      id: testAgentId,
      name: 'Test Agent for Find',
      description: 'A test agent for find operations',
      prompt: 'You are a test agent for finding.',
      modelId: 'gpt-4o',
      roleId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should find agent by ID successfully', async () => {
      // Mock the findOneAgent method to return a mock agent
      (agentService.findOneAgent as jest.Mock).mockResolvedValueOnce(mockAgent);

      // Call the resolver directly
      const result = await agentResolver.findOneAgent({ id: testAgentId }, {
        id: workspaceId,
      } as any);

      // Verify the service was called with the correct parameters
      expect(agentService.findOneAgent).toHaveBeenCalledWith(workspaceId, {
        id: testAgentId,
      });

      // Verify the result matches our expectations
      expect(result).toBeDefined();
      expect(result.id).toBe(testAgentId);
      expect(result.name).toBe('Test Agent for Find');
    });

    it('should throw an error for non-existent agent', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      // Mock the findOneAgent method to throw an exception
      (agentService.findOneAgent as jest.Mock).mockRejectedValueOnce(
        new AgentException(
          `Agent with id ${nonExistentId} not found`,
          AgentExceptionCode.AGENT_NOT_FOUND,
        ),
      );

      // Call the resolver and expect it to throw
      await expect(
        agentResolver.findOneAgent({ id: nonExistentId }, {
          id: workspaceId,
        } as any),
      ).rejects.toThrow(AgentException);
    });
  });

  describe('updateOneAgent', () => {
    const testAgentId = 'test-agent-id';
    const workspaceId = 'test-workspace-id';

    const updatedAgent = {
      id: testAgentId,
      name: 'Updated Test Agent Admin',
      description: 'Updated description',
      prompt: 'Updated prompt for admin',
      modelId: 'gpt-4o-mini',
      roleId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update an agent successfully', async () => {
      // Mock the updateOneAgent method to return the updated agent
      (agentService.updateOneAgent as jest.Mock).mockResolvedValueOnce(
        updatedAgent,
      );

      // Call the resolver directly
      const result = await agentResolver.updateOneAgent(
        {
          id: testAgentId,
          name: 'Updated Test Agent Admin',
          description: 'Updated description',
          prompt: 'Updated prompt for admin',
          modelId: 'gpt-4o-mini',
        },
        { id: workspaceId } as any,
      );

      // Verify the service was called with the correct parameters
      expect(agentService.updateOneAgent).toHaveBeenCalledWith(
        {
          id: testAgentId,
          name: 'Updated Test Agent Admin',
          description: 'Updated description',
          prompt: 'Updated prompt for admin',
          modelId: 'gpt-4o-mini',
        },
        workspaceId,
      );

      // Verify the result matches our expectations
      expect(result).toBeDefined();
      expect(result.id).toBe(testAgentId);
      expect(result.name).toBe('Updated Test Agent Admin');
      expect(result.description).toBe('Updated description');
      expect(result.prompt).toBe('Updated prompt for admin');
      expect(result.modelId).toBe('gpt-4o-mini');
    });
  });
});
