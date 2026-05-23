import { Test, type TestingModule } from '@nestjs/testing';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { FlatLogicFunctionValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-logic-function-validator.service';

const buildFlatLogicFunction = (
  overrides: Partial<FlatLogicFunction> = {},
): FlatLogicFunction =>
  ({
    id: '00000000-0000-0000-0000-000000000001',
    universalIdentifier: '00000000-0000-0000-0000-000000000001',
    name: 'Test function',
    description: null,
    runtime: 'nodejs22.x',
    timeoutSeconds: 300,
    sourceHandlerPath: 'src/index.ts',
    builtHandlerPath: 'src/index.mjs',
    handlerName: 'main',
    checksum: 'abc',
    isBuildUpToDate: true,
    executionMode: LogicFunctionExecutionMode.LIVE,
    cronTriggerSettings: null,
    databaseEventTriggerSettings: null,
    httpRouteTriggerSettings: null,
    toolTriggerSettings: null,
    workflowActionTriggerSettings: null,
    workspaceId: 'workspace-id',
    applicationId: '00000000-0000-0000-0000-000000000aaa',
    applicationUniversalIdentifier: '00000000-0000-0000-0000-000000000aaa',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    ...overrides,
  }) as unknown as FlatLogicFunction;

const buildLogicFunctionMaps = (
  existing?: FlatLogicFunction,
): FlatEntityMaps<FlatLogicFunction> => {
  const empty = {
    byUniversalIdentifier: {} as Record<string, FlatLogicFunction>,
    universalIdentifierById: {} as Record<string, string>,
    universalIdentifiersByApplicationId: {} as Record<string, string[]>,
  } as unknown as FlatEntityMaps<FlatLogicFunction>;

  if (existing) {
    (
      empty as unknown as {
        byUniversalIdentifier: Record<string, FlatLogicFunction>;
        universalIdentifierById: Record<string, string>;
      }
    ).byUniversalIdentifier[existing.universalIdentifier] = existing;
    (
      empty as unknown as {
        byUniversalIdentifier: Record<string, FlatLogicFunction>;
        universalIdentifierById: Record<string, string>;
      }
    ).universalIdentifierById[existing.id] = existing.universalIdentifier;
  }

  return empty;
};

const buildUpdateArgs = (
  flatEntityUpdate: Partial<FlatLogicFunction>,
  existing: FlatLogicFunction,
) =>
  ({
    universalIdentifier: existing.universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatLogicFunctionMaps: buildLogicFunctionMaps(existing),
    },
    buildOptions: {} as never,
  }) as unknown as Parameters<
    FlatLogicFunctionValidatorService['validateFlatLogicFunctionUpdate']
  >[0];

const buildCreateArgs = (
  flatEntityToValidate: FlatLogicFunction,
  optimisticMaps: FlatEntityMaps<FlatLogicFunction> = buildLogicFunctionMaps(),
) =>
  ({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatLogicFunctionMaps: optimisticMaps,
    },
    buildOptions: {} as never,
  }) as unknown as Parameters<
    FlatLogicFunctionValidatorService['validateFlatLogicFunctionCreation']
  >[0];

describe('FlatLogicFunctionValidatorService', () => {
  let service: FlatLogicFunctionValidatorService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [FlatLogicFunctionValidatorService],
    }).compile();

    service = moduleRef.get(FlatLogicFunctionValidatorService);
  });

  describe('validateFlatLogicFunctionUpdate', () => {
    it('passes when keeping executionMode=LIVE', () => {
      const existing = buildFlatLogicFunction();

      const result = service.validateFlatLogicFunctionUpdate(
        buildUpdateArgs({}, existing),
      );

      expect(result.errors).toHaveLength(0);
    });

    it('passes when flipping to PREBUILT with a fresh build and checksum', () => {
      const existing = buildFlatLogicFunction();

      const result = service.validateFlatLogicFunctionUpdate(
        buildUpdateArgs(
          { executionMode: LogicFunctionExecutionMode.PREBUILT },
          existing,
        ),
      );

      expect(result.errors).toHaveLength(0);
    });

    it('rejects flipping to PREBUILT when build is stale', () => {
      const existing = buildFlatLogicFunction({ isBuildUpToDate: false });

      const result = service.validateFlatLogicFunctionUpdate(
        buildUpdateArgs(
          { executionMode: LogicFunctionExecutionMode.PREBUILT },
          existing,
        ),
      );

      expect(result.errors.map((error) => error.code)).toContain(
        LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
      );
    });

    it('rejects flipping to PREBUILT when checksum is missing', () => {
      const existing = buildFlatLogicFunction({ checksum: null });

      const result = service.validateFlatLogicFunctionUpdate(
        buildUpdateArgs(
          { executionMode: LogicFunctionExecutionMode.PREBUILT },
          existing,
        ),
      );

      expect(result.errors.map((error) => error.code)).toContain(
        LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
      );
    });

    it('accepts a single update that brings build, checksum and PREBUILT together', () => {
      const existing = buildFlatLogicFunction({
        isBuildUpToDate: false,
        checksum: null,
      });

      const result = service.validateFlatLogicFunctionUpdate(
        buildUpdateArgs(
          {
            executionMode: LogicFunctionExecutionMode.PREBUILT,
            isBuildUpToDate: true,
            checksum: 'fresh',
          },
          existing,
        ),
      );

      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateFlatLogicFunctionCreation', () => {
    it('passes for a valid LIVE creation', () => {
      const result = service.validateFlatLogicFunctionCreation(
        buildCreateArgs(buildFlatLogicFunction()),
      );

      expect(result.errors).toHaveLength(0);
    });

    it('passes for a PREBUILT creation with build and checksum', () => {
      const result = service.validateFlatLogicFunctionCreation(
        buildCreateArgs(
          buildFlatLogicFunction({
            executionMode: LogicFunctionExecutionMode.PREBUILT,
            isBuildUpToDate: true,
            checksum: 'abc',
          }),
        ),
      );

      expect(result.errors).toHaveLength(0);
    });

    it('rejects a PREBUILT creation without a checksum', () => {
      const result = service.validateFlatLogicFunctionCreation(
        buildCreateArgs(
          buildFlatLogicFunction({
            executionMode: LogicFunctionExecutionMode.PREBUILT,
            isBuildUpToDate: true,
            checksum: null,
          }),
        ),
      );

      expect(result.errors.map((error) => error.code)).toContain(
        LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
      );
    });

    it('rejects a PREBUILT creation with a stale build', () => {
      const result = service.validateFlatLogicFunctionCreation(
        buildCreateArgs(
          buildFlatLogicFunction({
            executionMode: LogicFunctionExecutionMode.PREBUILT,
            isBuildUpToDate: false,
            checksum: 'abc',
          }),
        ),
      );

      expect(result.errors.map((error) => error.code)).toContain(
        LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
      );
    });
  });
});
