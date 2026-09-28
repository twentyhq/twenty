import { Test } from '@nestjs/testing';

import { LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { LogicFunctionFromSourceHelperService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source-helper.service';
import { type UniversalFlatLogicFunction } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-logic-function.type';
import { LogicFunctionFromSourceService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source.service';

describe('duplicate app logic function', () => {
  it('copies resources from the owning app to unique editable workspace paths', async () => {
    const copyResources = jest.fn();
    const createOneFromMetadata = jest
      .fn()
      .mockImplementation(
        async ({
          universalFlatLogicFunctionToCreate,
        }: {
          universalFlatLogicFunctionToCreate: UniversalFlatLogicFunction;
        }) => universalFlatLogicFunctionToCreate,
      );
    const buildHandlerPaths = jest.fn().mockImplementation((id: string) => ({
      sourceHandlerPath: `${id}/src/index.ts`,
      builtHandlerPath: `${id}/src/index.mjs`,
    }));
    const module = await Test.createTestingModule({
      providers: [
        LogicFunctionFromSourceService,
        { provide: LogicFunctionResourceService, useValue: { copyResources } },
        {
          provide: LogicFunctionFromSourceHelperService,
          useValue: {
            findLogicFunctionAndApplicationOrThrow: jest
              .fn()
              .mockResolvedValue({
                flatLogicFunction: {
                  id: 'source',
                  name: 'Code',
                  applicationUniversalIdentifier: 'installed-app',
                  sourceHandlerPath: 'src/prepare.function.ts',
                  builtHandlerPath: 'prepare.mjs',
                  handlerName: 'default.config.handler',
                  isBuildUpToDate: true,
                  workflowActionTriggerSettings: { isEditable: true },
                },
                ownerFlatApplication: {
                  universalIdentifier: 'workspace-custom-app',
                },
              }),
            buildHandlerPaths,
            createOneFromMetadata,
          },
        },
      ],
    })
      .useMocker(() => ({}))
      .compile();
    const service = module.get(LogicFunctionFromSourceService);
    const first = await service.duplicateOneWithSource({
      existingLogicFunctionId: 'source',
      workspaceId: 'workspace',
    });
    const second = await service.duplicateOneWithSource({
      existingLogicFunctionId: 'source',
      workspaceId: 'workspace',
    });

    expect(first.id).not.toBe(second.id);
    expect(copyResources).toHaveBeenNthCalledWith(1, {
      workspaceId: 'workspace',
      fromApplicationUniversalIdentifier: 'installed-app',
      applicationUniversalIdentifier: 'workspace-custom-app',
      fromSourceHandlerPath: 'src/prepare.function.ts',
      fromBuiltHandlerPath: 'prepare.mjs',
      toSourceHandlerPath: `${first.id}/src/index.ts`,
      toBuiltHandlerPath: `${first.id}/src/index.mjs`,
    });
    expect(createOneFromMetadata).toHaveBeenCalledWith(
      expect.objectContaining({
        universalFlatLogicFunctionToCreate: expect.objectContaining({
          applicationUniversalIdentifier: 'workspace-custom-app',
          handlerName: 'default.config.handler',
        }),
      }),
    );
  });
});
