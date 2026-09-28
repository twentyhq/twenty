import { Test } from '@nestjs/testing';

import { LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { LogicFunctionFromSourceService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source.service';

describe('LogicFunctionFromSourceService.getSourceCode', () => {
  const getSourceFile = jest.fn();
  const getOrRecomputeManyOrAllFlatEntityMaps = jest.fn();
  let service: LogicFunctionFromSourceService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LogicFunctionFromSourceService,
        {
          provide: LogicFunctionResourceService,
          useValue: { getSourceFile },
        },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: { getOrRecomputeManyOrAllFlatEntityMaps },
        },
      ],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get(LogicFunctionFromSourceService);
    getSourceFile.mockResolvedValue('export const main = () => "hello";');
  });

  it.each(['installed-app', 'workspace-custom-app'])(
    'reads source from its owning %s',
    async (applicationUniversalIdentifier) => {
      getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue({
        flatLogicFunctionMaps: {
          universalIdentifierById: { 'function-id': 'function-universal-id' },
          byUniversalIdentifier: {
            'function-universal-id': {
              applicationUniversalIdentifier,
              sourceHandlerPath: 'src/prepare.function.ts',
            },
          },
        },
      });

      await expect(
        service.getSourceCode({
          id: 'function-id',
          workspaceId: 'workspace-id',
        }),
      ).resolves.toBe('export const main = () => "hello";');
      expect(getOrRecomputeManyOrAllFlatEntityMaps).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        flatMapsKeys: ['flatLogicFunctionMaps'],
      });
      expect(getSourceFile).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        applicationUniversalIdentifier,
        sourceHandlerPath: 'src/prepare.function.ts',
      });
    },
  );

  it('does not read source for a function outside the workspace', async () => {
    getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue({
      flatLogicFunctionMaps: {
        universalIdentifierById: {},
        byUniversalIdentifier: {},
      },
    });

    await expect(
      service.getSourceCode({
        id: 'other-workspace-function',
        workspaceId: 'workspace-id',
      }),
    ).rejects.toThrow();
    expect(getSourceFile).not.toHaveBeenCalled();
  });
});
