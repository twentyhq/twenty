import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { LogicFunctionFromSourceHelperService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source-helper.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// Simulates a Windows host, where the platform path module joins with backslashes
jest.mock(
  'path',
  () => jest.requireActual<typeof import('path')>('path').win32,
);

describe('LogicFunctionFromSourceHelperService', () => {
  let service: LogicFunctionFromSourceHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogicFunctionFromSourceHelperService,
        { provide: ApplicationService, useValue: {} },
        { provide: WorkspaceManyOrAllFlatEntityMapsCacheService, useValue: {} },
        {
          provide: WorkspaceMigrationValidateBuildAndRunService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get(LogicFunctionFromSourceHelperService);
  });

  describe('buildHandlerPaths', () => {
    it('should build storage paths with forward slashes on every platform', () => {
      const logicFunctionId = '20202020-0000-4000-8000-000000000001';

      expect(service.buildHandlerPaths(logicFunctionId)).toEqual({
        sourceHandlerPath: `${logicFunctionId}/src/index.ts`,
        builtHandlerPath: `${logicFunctionId}/src/index.mjs`,
      });
    });
  });
});
