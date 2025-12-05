import { Test } from '@nestjs/testing';

import { FieldActorSource } from 'twenty-shared/types';

import { CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { DeleteRecordService } from 'src/engine/core-modules/record-crud/services/delete-record.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { PerObjectToolGeneratorService } from 'src/engine/core-modules/tool-generator/services/per-object-tool-generator.service';
import { type ToolHints } from 'src/engine/metadata-modules/ai/ai-chat-router/types/tool-hints.interface';
import { ToolService } from 'src/engine/metadata-modules/ai/ai-tools/services/tool.service';

describe('ToolService', () => {
  const workspaceId = 'ws_1';
  const roleId = 'role_1';

  let service: ToolService;
  let perObjectToolGenerator: PerObjectToolGeneratorService;

  const mockTools = {
    create_testObject: {
      description: 'Create a test object',
      inputSchema: {},
      execute: jest.fn(),
    },
    update_testObject: {
      description: 'Update a test object',
      inputSchema: {},
      execute: jest.fn(),
    },
    find_testObject: {
      description: 'Find test objects',
      inputSchema: {},
      execute: jest.fn(),
    },
    soft_delete_testObject: {
      description: 'Soft delete a test object',
      inputSchema: {},
      execute: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ToolService,
        {
          provide: PerObjectToolGeneratorService,
          useValue: {
            generate: jest.fn().mockResolvedValue(mockTools),
          },
        },
        {
          provide: CreateRecordService,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateRecordService,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteRecordService,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindRecordsService,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    service = moduleRef.get(ToolService);
    perObjectToolGenerator = moduleRef.get(PerObjectToolGeneratorService);
  });

  describe('listTools', () => {
    it('should call perObjectToolGenerator.generate with correct parameters', async () => {
      const tools = await service.listTools({ unionOf: [roleId] }, workspaceId);

      expect(perObjectToolGenerator.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId,
          rolePermissionConfig: { unionOf: [roleId] },
        }),
        expect.any(Array),
        undefined,
      );

      expect(tools).toBe(mockTools);
    });

    it('should pass toolHints to perObjectToolGenerator.generate', async () => {
      const toolHints: ToolHints = {
        relevantObjects: ['company', 'person'],
        operations: ['create', 'find'],
      };

      await service.listTools(
        { unionOf: [roleId] },
        workspaceId,
        undefined,
        toolHints,
      );

      expect(perObjectToolGenerator.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId,
          rolePermissionConfig: { unionOf: [roleId] },
        }),
        expect.any(Array),
        toolHints,
      );
    });

    it('should pass actorContext to perObjectToolGenerator.generate', async () => {
      const actorContext = {
        source: FieldActorSource.API,
        workspaceMemberId: 'member_1',
        name: 'Test User',
        context: {},
      };

      await service.listTools({ unionOf: [roleId] }, workspaceId, actorContext);

      expect(perObjectToolGenerator.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId,
          rolePermissionConfig: { unionOf: [roleId] },
          actorContext,
        }),
        expect.any(Array),
        undefined,
      );
    });
  });
});
