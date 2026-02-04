import { Test, type TestingModule } from '@nestjs/testing';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { CodeStepBuildService } from 'src/modules/workflow/code-step-build/services/code-step-build.service';

describe('CodeStepBuildService', () => {
  let service: CodeStepBuildService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodeStepBuildService,
        {
          provide: FileStorageService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CodeStepBuildService>(CodeStepBuildService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isWorkflowCodeStepLogicFunction', () => {
    it('should return true when sourceHandlerPath starts with workflow/', () => {
      const flatLogicFunction = {
        sourceHandlerPath: 'workflow/abc-123/index.ts',
        builtHandlerPath: 'workflow/abc-123/index.mjs',
      } as FlatLogicFunction;

      expect(service.isWorkflowCodeStepLogicFunction(flatLogicFunction)).toBe(
        true,
      );
    });

    it('should return true when builtHandlerPath starts with workflow/', () => {
      const flatLogicFunction = {
        sourceHandlerPath: 'other/path/index.ts',
        builtHandlerPath: 'workflow/abc-123/index.mjs',
      } as FlatLogicFunction;

      expect(service.isWorkflowCodeStepLogicFunction(flatLogicFunction)).toBe(
        true,
      );
    });

    it('should return false when neither path starts with workflow/', () => {
      const flatLogicFunction = {
        sourceHandlerPath: 'app/handlers/index.ts',
        builtHandlerPath: 'app/handlers/index.mjs',
      } as FlatLogicFunction;

      expect(service.isWorkflowCodeStepLogicFunction(flatLogicFunction)).toBe(
        false,
      );
    });
  });
});
