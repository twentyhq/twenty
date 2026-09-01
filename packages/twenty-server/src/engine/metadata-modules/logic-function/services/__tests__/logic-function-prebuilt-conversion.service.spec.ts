import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { LogicFunctionPrebuiltConversionService } from 'src/engine/metadata-modules/logic-function/services/logic-function-prebuilt-conversion.service';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = 'e8f1b2c3-0000-4000-8000-000000000001';
const PACKAGED_APPLICATION_ID = 'e8f1b2c3-0000-4000-8000-000000000002';
const LOCAL_APPLICATION_ID = 'e8f1b2c3-0000-4000-8000-000000000003';

const buildFlatApplication = (
  overrides: Partial<FlatApplication>,
): FlatApplication =>
  ({
    universalIdentifier: `universal-${overrides.id}`,
    sourceType: ApplicationRegistrationSourceType.TARBALL,
    deletedAt: null,
    ...overrides,
  }) as FlatApplication;

const buildFlatLogicFunction = (
  overrides: Partial<FlatLogicFunction>,
): FlatLogicFunction =>
  ({
    executionMode: LogicFunctionExecutionMode.LIVE,
    isBuildUpToDate: true,
    checksum: 'checksum-1',
    deletedAt: null,
    ...overrides,
  }) as FlatLogicFunction;

describe('LogicFunctionPrebuiltConversionService', () => {
  let service: LogicFunctionPrebuiltConversionService;
  let getOrRecomputeManyOrAllFlatEntityMaps: jest.Mock;
  let validateBuildAndRunWorkspaceMigration: jest.Mock;

  const setFlatEntityMaps = ({
    flatLogicFunctions,
    flatApplications,
  }: {
    flatLogicFunctions: FlatLogicFunction[];
    flatApplications: FlatApplication[];
  }) => {
    getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue({
      flatLogicFunctionMaps: {
        byUniversalIdentifier: Object.fromEntries(
          flatLogicFunctions.map((flatLogicFunction) => [
            flatLogicFunction.universalIdentifier,
            flatLogicFunction,
          ]),
        ),
        universalIdentifiersByApplicationId: flatLogicFunctions.reduce<
          Record<string, string[]>
        >((accumulator, flatLogicFunction) => {
          const applicationId = flatLogicFunction.applicationId as string;

          accumulator[applicationId] = [
            ...(accumulator[applicationId] ?? []),
            flatLogicFunction.universalIdentifier,
          ];

          return accumulator;
        }, {}),
      },
      flatApplicationMaps: {
        byId: Object.fromEntries(
          flatApplications.map((flatApplication) => [
            flatApplication.id,
            flatApplication,
          ]),
        ),
      },
    });
  };

  beforeEach(async () => {
    getOrRecomputeManyOrAllFlatEntityMaps = jest.fn();
    validateBuildAndRunWorkspaceMigration = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogicFunctionPrebuiltConversionService,
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: { getOrRecomputeManyOrAllFlatEntityMaps },
        },
        {
          provide: WorkspaceMigrationValidateBuildAndRunService,
          useValue: { validateBuildAndRunWorkspaceMigration },
        },
      ],
    }).compile();

    service = module.get(LogicFunctionPrebuiltConversionService);
  });

  describe('findApplicationIdsToConvert', () => {
    it('should only return applications owning at least one convertible logic function', async () => {
      setFlatEntityMaps({
        flatApplications: [
          buildFlatApplication({ id: PACKAGED_APPLICATION_ID }),
          buildFlatApplication({
            id: LOCAL_APPLICATION_ID,
            sourceType: ApplicationRegistrationSourceType.LOCAL,
          }),
        ],
        flatLogicFunctions: [
          buildFlatLogicFunction({
            universalIdentifier: 'packaged-live',
            applicationId: PACKAGED_APPLICATION_ID,
          }),
          buildFlatLogicFunction({
            universalIdentifier: 'local-live',
            applicationId: LOCAL_APPLICATION_ID,
          }),
        ],
      });

      expect(
        await service.findApplicationIdsToConvert({
          workspaceId: WORKSPACE_ID,
        }),
      ).toEqual([PACKAGED_APPLICATION_ID]);
    });

    it('should not return applications whose logic functions are all already prebuilt', async () => {
      setFlatEntityMaps({
        flatApplications: [
          buildFlatApplication({ id: PACKAGED_APPLICATION_ID }),
        ],
        flatLogicFunctions: [
          buildFlatLogicFunction({
            universalIdentifier: 'packaged-prebuilt',
            applicationId: PACKAGED_APPLICATION_ID,
            executionMode: LogicFunctionExecutionMode.PREBUILT,
          }),
        ],
      });

      expect(
        await service.findApplicationIdsToConvert({
          workspaceId: WORKSPACE_ID,
        }),
      ).toEqual([]);
    });
  });

  describe('convertApplicationLogicFunctionsToPrebuilt', () => {
    it('should only update the convertible logic functions of the application', async () => {
      setFlatEntityMaps({
        flatApplications: [
          buildFlatApplication({ id: PACKAGED_APPLICATION_ID }),
        ],
        flatLogicFunctions: [
          buildFlatLogicFunction({
            universalIdentifier: 'convertible',
            applicationId: PACKAGED_APPLICATION_ID,
          }),
          buildFlatLogicFunction({
            universalIdentifier: 'stale-build',
            applicationId: PACKAGED_APPLICATION_ID,
            isBuildUpToDate: false,
          }),
        ],
      });

      const convertedFlatLogicFunctions =
        await service.convertApplicationLogicFunctionsToPrebuilt({
          workspaceId: WORKSPACE_ID,
          applicationId: PACKAGED_APPLICATION_ID,
        });

      expect(convertedFlatLogicFunctions).toHaveLength(1);
      expect(convertedFlatLogicFunctions[0]).toMatchObject({
        universalIdentifier: 'convertible',
        executionMode: LogicFunctionExecutionMode.PREBUILT,
      });
      expect(validateBuildAndRunWorkspaceMigration).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: WORKSPACE_ID,
          applicationUniversalIdentifier: `universal-${PACKAGED_APPLICATION_ID}`,
        }),
      );
    });

    it('should not run a migration when nothing is convertible', async () => {
      setFlatEntityMaps({
        flatApplications: [
          buildFlatApplication({ id: PACKAGED_APPLICATION_ID }),
        ],
        flatLogicFunctions: [
          buildFlatLogicFunction({
            universalIdentifier: 'already-prebuilt',
            applicationId: PACKAGED_APPLICATION_ID,
            executionMode: LogicFunctionExecutionMode.PREBUILT,
          }),
        ],
      });

      expect(
        await service.convertApplicationLogicFunctionsToPrebuilt({
          workspaceId: WORKSPACE_ID,
          applicationId: PACKAGED_APPLICATION_ID,
        }),
      ).toEqual([]);
      expect(validateBuildAndRunWorkspaceMigration).not.toHaveBeenCalled();
    });

    it('should not run a migration when the application has been deleted', async () => {
      setFlatEntityMaps({
        flatApplications: [
          buildFlatApplication({
            id: PACKAGED_APPLICATION_ID,
            deletedAt: new Date(),
          }),
        ],
        flatLogicFunctions: [
          buildFlatLogicFunction({
            universalIdentifier: 'orphan',
            applicationId: PACKAGED_APPLICATION_ID,
          }),
        ],
      });

      expect(
        await service.convertApplicationLogicFunctionsToPrebuilt({
          workspaceId: WORKSPACE_ID,
          applicationId: PACKAGED_APPLICATION_ID,
        }),
      ).toEqual([]);
      expect(validateBuildAndRunWorkspaceMigration).not.toHaveBeenCalled();
    });

    it('should throw when the migration fails', async () => {
      setFlatEntityMaps({
        flatApplications: [
          buildFlatApplication({ id: PACKAGED_APPLICATION_ID }),
        ],
        flatLogicFunctions: [
          buildFlatLogicFunction({
            universalIdentifier: 'convertible',
            applicationId: PACKAGED_APPLICATION_ID,
          }),
        ],
      });
      validateBuildAndRunWorkspaceMigration.mockResolvedValue({
        status: 'fail',
      });

      await expect(
        service.convertApplicationLogicFunctionsToPrebuilt({
          workspaceId: WORKSPACE_ID,
          applicationId: PACKAGED_APPLICATION_ID,
        }),
      ).rejects.toThrow(WorkspaceMigrationBuilderException);
    });
  });
});
