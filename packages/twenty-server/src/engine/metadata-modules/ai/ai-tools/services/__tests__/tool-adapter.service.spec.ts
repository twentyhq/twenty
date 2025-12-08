import { Test } from '@nestjs/testing';

import { jsonSchema } from 'ai';

import { ToolType } from 'src/engine/core-modules/tool/enums/tool-type.enum';
import { ToolRegistryService } from 'src/engine/core-modules/tool/services/tool-registry.service';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { ToolAdapterService } from 'src/engine/metadata-modules/ai/ai-tools/services/tool-adapter.service';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

const createMockToolRegistry = () => ({
  getAllToolTypes: jest.fn(),
  getTool: jest.fn(),
});

const createMockPermissions = () => ({
  hasToolPermission: jest.fn<
    Promise<boolean>,
    [RolePermissionConfig, string, PermissionFlagType]
  >(),
});

describe('ToolAdapterService', () => {
  let mockRegistry: ReturnType<typeof createMockToolRegistry>;
  let mockPermissions: ReturnType<typeof createMockPermissions>;
  let service: ToolAdapterService;

  // Shared tools
  const unflaggedToolExecute = jest.fn(async (input: ToolInput) => ({
    success: true,
    message: 'Tool executed successfully',
    result: { echoed: input },
  }));
  const unflaggedTool: Tool = {
    description: 'HTTP Request tool',
    inputSchema: jsonSchema({ type: 'object', properties: {} }),
    execute: unflaggedToolExecute,
  };

  const flaggedToolExecute = jest.fn(async (input: ToolInput) => ({
    success: true,
    message: 'Tool executed successfully',
    result: { sent: input },
  }));
  const flaggedTool: Tool = {
    description: 'Send Email tool',
    inputSchema: jsonSchema({ type: 'object', properties: {} }),
    execute: flaggedToolExecute,
    flag: PermissionFlagType.SEND_EMAIL_TOOL,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRegistry = createMockToolRegistry();
    mockPermissions = createMockPermissions();

    // Setup mock tool responses
    mockRegistry.getAllToolTypes.mockReturnValue([
      ToolType.HTTP_REQUEST,
      ToolType.SEND_EMAIL,
    ]);
    mockRegistry.getTool.mockImplementation((type: ToolType) => {
      if (type === ToolType.HTTP_REQUEST) return unflaggedTool;
      if (type === ToolType.SEND_EMAIL) return flaggedTool;
      throw new Error('Tool not found in mock');
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        ToolAdapterService,
        {
          provide: ToolRegistryService,
          useValue: mockRegistry,
        },
        {
          provide: PermissionsService,
          useValue: mockPermissions,
        },
      ],
    }).compile();

    service = moduleRef.get(ToolAdapterService);
  });

  it('should include unflagged tools regardless of rolePermissionConfig', async () => {
    const toolsNoContext = await service.getTools('ws-1');

    expect(Object.keys(toolsNoContext)).toContain('http_request');

    const toolsWithPartialContext = await service.getTools('ws-1', {
      unionOf: ['role-1'],
    });

    expect(Object.keys(toolsWithPartialContext)).toContain('http_request');
  });

  it('should not include flagged tools when rolePermissionConfig is missing', async () => {
    const toolsNoRoleConfig = await service.getTools('ws-1');

    expect(Object.keys(toolsNoRoleConfig)).not.toContain('send_email');
  });

  it('should include flagged tools when permission is granted', async () => {
    mockPermissions.hasToolPermission.mockResolvedValueOnce(true);

    const tools = await service.getTools('ws-1', { unionOf: ['role-1'] });

    expect(mockPermissions.hasToolPermission).toHaveBeenCalledWith(
      { unionOf: ['role-1'] },
      'ws-1',
      PermissionFlagType.SEND_EMAIL_TOOL,
    );

    expect(Object.keys(tools)).toContain('send_email');
  });

  it('should exclude flagged tools when permission is denied', async () => {
    mockPermissions.hasToolPermission.mockResolvedValueOnce(false);

    const tools = await service.getTools('ws-1', { unionOf: ['role-1'] });

    expect(Object.keys(tools)).not.toContain('send_email');
  });

  it('should lowercase tool type keys in the returned ToolSet', async () => {
    const tools = await service.getTools('ws-1');

    const keys = Object.keys(tools);

    expect(keys).toContain('http_request');
    expect(keys).not.toContain(ToolType.HTTP_REQUEST); // ensure enum raw value not used as-is
  });

  it('should forward execute input correctly and return underlying result', async () => {
    const tools = await service.getTools('ws-1');

    const input = { url: 'https://example.com', method: 'GET' } as ToolInput;
    const result = await tools['http_request'].execute?.(
      { input },
      {
        toolCallId: 'test-tool-call-id',
        messages: [
          {
            role: 'user',
            content: 'content',
          },
        ],
      },
    );

    // Ensure wrapper forwards only parameters.input
    expect(unflaggedToolExecute).toHaveBeenCalledWith(input);
    expect(result).toEqual({
      success: true,
      message: 'Tool executed successfully',
      result: { echoed: input },
    });
  });
});
