import { Test, type TestingModule } from '@nestjs/testing';

import { PermissionFlagType } from 'twenty-shared/constants';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { type FlatPermissionFlagDefinition } from 'src/engine/metadata-modules/flat-permission-flag-definition/types/flat-permission-flag-definition.type';
import { type PermissionFlagDefinitionPermissionType } from 'src/engine/metadata-modules/permission-flag-definition/constants/permission-flag-definition-permission-type.constant';
import { PermissionFlagDefinitionExceptionCode } from 'src/engine/metadata-modules/permission-flag-definition/permission-flag-definition.exception';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { FlatPermissionFlagDefinitionValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-permission-flag-definition-validator.service';

const buildFlatDefinition = (
  overrides: Partial<FlatPermissionFlagDefinition> = {},
): FlatPermissionFlagDefinition =>
  ({
    id: '00000000-0000-0000-0000-000000000001',
    universalIdentifier: '00000000-0000-0000-0000-000000000001',
    key: 'TEST_FLAG',
    label: 'Test Flag',
    description: 'A flag for tests',
    iconKey: 'IconTest',
    permissionType: 'tool',
    isRelevantForAgents: true,
    isRelevantForUsers: false,
    isRelevantForApiKeys: false,
    isCustom: false,
    workspaceId: 'workspace-id',
    applicationId: '00000000-0000-0000-0000-000000000aaa',
    applicationUniversalIdentifier: '00000000-0000-0000-0000-000000000aaa',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }) as unknown as FlatPermissionFlagDefinition;

const buildEmptyMaps = (): FlatEntityMaps<FlatPermissionFlagDefinition> =>
  createEmptyFlatEntityMaps() as unknown as FlatEntityMaps<FlatPermissionFlagDefinition>;

const buildEmptyPermissionFlagMaps = (): FlatEntityMaps<FlatPermissionFlag> =>
  createEmptyFlatEntityMaps() as unknown as FlatEntityMaps<FlatPermissionFlag>;

const buildFlatPermissionFlag = (
  overrides: Partial<FlatPermissionFlag> = {},
): FlatPermissionFlag =>
  ({
    id: '00000000-0000-0000-0000-000000000101',
    universalIdentifier: '00000000-0000-0000-0000-000000000101',
    flag: 'TEST_FLAG',
    roleUniversalIdentifier: '00000000-0000-0000-0000-000000000201',
    workspaceId: 'workspace-id',
    applicationId: '00000000-0000-0000-0000-000000000aaa',
    applicationUniversalIdentifier: '00000000-0000-0000-0000-000000000aaa',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }) as unknown as FlatPermissionFlag;

const buildArgs = (
  flatEntityToValidate: FlatPermissionFlagDefinition,
  optimisticMaps: FlatEntityMaps<FlatPermissionFlagDefinition> = buildEmptyMaps(),
) =>
  ({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPermissionFlagDefinitionMaps: optimisticMaps,
    },
    buildOptions: {} as never,
  }) as unknown as Parameters<
    FlatPermissionFlagDefinitionValidatorService['validateFlatPermissionFlagDefinitionCreation']
  >[0];

describe('FlatPermissionFlagDefinitionValidatorService', () => {
  let service: FlatPermissionFlagDefinitionValidatorService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [FlatPermissionFlagDefinitionValidatorService],
    }).compile();

    service = moduleRef.get(FlatPermissionFlagDefinitionValidatorService);
  });

  describe('validateFlatPermissionFlagDefinitionCreation', () => {
    it('passes for a valid definition', () => {
      const result = service.validateFlatPermissionFlagDefinitionCreation(
        buildArgs(buildFlatDefinition()),
      );

      expect(result.errors).toHaveLength(0);
    });

    it('rejects an empty key', () => {
      const result = service.validateFlatPermissionFlagDefinitionCreation(
        buildArgs(buildFlatDefinition({ key: '' })),
      );

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagDefinitionExceptionCode.INVALID_PERMISSION_FLAG_DEFINITION_KEY,
      ]);
    });

    it('rejects an unknown permission type', () => {
      const result = service.validateFlatPermissionFlagDefinitionCreation(
        buildArgs(
          buildFlatDefinition({
            permissionType: 'invalid' as PermissionFlagDefinitionPermissionType,
          }),
        ),
      );

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagDefinitionExceptionCode.INVALID_PERMISSION_FLAG_DEFINITION_PERMISSION_TYPE,
      ]);
    });

    it('rejects a duplicate key in the same workspace', () => {
      const existing = buildFlatDefinition({
        universalIdentifier: '00000000-0000-0000-0000-000000000999',
        key: 'EXISTING_KEY',
      });
      const optimisticMaps = buildEmptyMaps();
      optimisticMaps.byUniversalIdentifier[existing.universalIdentifier] =
        existing;

      const result = service.validateFlatPermissionFlagDefinitionCreation(
        buildArgs(buildFlatDefinition({ key: 'EXISTING_KEY' }), optimisticMaps),
      );

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_ALREADY_EXISTS,
      ]);
    });

    it('rejects a duplicate universal identifier', () => {
      const existing = buildFlatDefinition();
      const optimisticMaps = buildEmptyMaps();
      optimisticMaps.byUniversalIdentifier[existing.universalIdentifier] =
        existing;

      const result = service.validateFlatPermissionFlagDefinitionCreation(
        buildArgs(
          buildFlatDefinition({
            id: '00000000-0000-0000-0000-000000000002',
            key: 'ANOTHER_TEST_FLAG',
          }),
          optimisticMaps,
        ),
      );

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_ALREADY_EXISTS,
      ]);
    });
  });

  describe('validateFlatPermissionFlagDefinitionUpdate', () => {
    it('passes for a valid update', () => {
      const existing = buildFlatDefinition();
      const optimisticMaps = buildEmptyMaps();
      optimisticMaps.byUniversalIdentifier[existing.universalIdentifier] =
        existing;

      const result = service.validateFlatPermissionFlagDefinitionUpdate({
        universalIdentifier: existing.universalIdentifier,
        flatEntityUpdate: { label: 'Updated Label' },
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatPermissionFlagDefinitionMaps: optimisticMaps,
        },
        buildOptions: {} as never,
      } as unknown as Parameters<
        FlatPermissionFlagDefinitionValidatorService['validateFlatPermissionFlagDefinitionUpdate']
      >[0]);

      expect(result.errors).toHaveLength(0);
    });

    it('rejects updating the immutable key field', () => {
      const existing = buildFlatDefinition({ key: 'ORIGINAL_KEY' });
      const optimisticMaps = buildEmptyMaps();
      optimisticMaps.byUniversalIdentifier[existing.universalIdentifier] =
        existing;

      const result = service.validateFlatPermissionFlagDefinitionUpdate({
        universalIdentifier: existing.universalIdentifier,
        flatEntityUpdate: { key: 'NEW_KEY' },
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatPermissionFlagDefinitionMaps: optimisticMaps,
        },
        buildOptions: {} as never,
      } as unknown as Parameters<
        FlatPermissionFlagDefinitionValidatorService['validateFlatPermissionFlagDefinitionUpdate']
      >[0]);

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_KEY_IMMUTABLE,
      ]);
    });

    it('returns not-found if no existing definition matches the universalIdentifier', () => {
      const result = service.validateFlatPermissionFlagDefinitionUpdate({
        universalIdentifier: '00000000-0000-0000-0000-deadbeefdead',
        flatEntityUpdate: { label: 'New Label' },
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatPermissionFlagDefinitionMaps: buildEmptyMaps(),
        },
        buildOptions: {} as never,
      } as unknown as Parameters<
        FlatPermissionFlagDefinitionValidatorService['validateFlatPermissionFlagDefinitionUpdate']
      >[0]);

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_NOT_FOUND,
      ]);
    });

    it('rejects updating a standard definition from a custom application', () => {
      const existing = buildFlatDefinition({
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION.universalIdentifier,
      });
      const optimisticMaps = buildEmptyMaps();
      optimisticMaps.byUniversalIdentifier[existing.universalIdentifier] =
        existing;

      const result = service.validateFlatPermissionFlagDefinitionUpdate({
        universalIdentifier: existing.universalIdentifier,
        flatEntityUpdate: { label: 'Updated Label' },
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatPermissionFlagDefinitionMaps: optimisticMaps,
        },
        buildOptions: {
          isSystemBuild: false,
          applicationUniversalIdentifier:
            '00000000-0000-0000-0000-000000000aaa',
        },
      } as unknown as Parameters<
        FlatPermissionFlagDefinitionValidatorService['validateFlatPermissionFlagDefinitionUpdate']
      >[0]);

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_IS_STANDARD,
      ]);
    });

    it('rejects updating to an unknown permission type', () => {
      const existing = buildFlatDefinition();
      const optimisticMaps = buildEmptyMaps();
      optimisticMaps.byUniversalIdentifier[existing.universalIdentifier] =
        existing;

      const result = service.validateFlatPermissionFlagDefinitionUpdate({
        universalIdentifier: existing.universalIdentifier,
        flatEntityUpdate: {
          permissionType: 'invalid' as PermissionFlagDefinitionPermissionType,
        },
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatPermissionFlagDefinitionMaps: optimisticMaps,
        },
        buildOptions: {} as never,
      } as unknown as Parameters<
        FlatPermissionFlagDefinitionValidatorService['validateFlatPermissionFlagDefinitionUpdate']
      >[0]);

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagDefinitionExceptionCode.INVALID_PERMISSION_FLAG_DEFINITION_PERMISSION_TYPE,
      ]);
    });
  });

  describe('validateFlatPermissionFlagDefinitionDeletion', () => {
    it('passes for a valid deletion', () => {
      const existing = buildFlatDefinition();
      const optimisticMaps = buildEmptyMaps();
      optimisticMaps.byUniversalIdentifier[existing.universalIdentifier] =
        existing;

      const result = service.validateFlatPermissionFlagDefinitionDeletion({
        flatEntityToValidate: existing,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatPermissionFlagDefinitionMaps: optimisticMaps,
          flatPermissionFlagMaps: buildEmptyPermissionFlagMaps(),
        },
        buildOptions: {} as never,
      } as unknown as Parameters<
        FlatPermissionFlagDefinitionValidatorService['validateFlatPermissionFlagDefinitionDeletion']
      >[0]);

      expect(result.errors).toHaveLength(0);
    });

    it('returns not-found if no existing definition matches the universalIdentifier', () => {
      const result = service.validateFlatPermissionFlagDefinitionDeletion({
        flatEntityToValidate: buildFlatDefinition({
          universalIdentifier: '00000000-0000-0000-0000-deadbeefdead',
        }),
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatPermissionFlagDefinitionMaps: buildEmptyMaps(),
          flatPermissionFlagMaps: buildEmptyPermissionFlagMaps(),
        },
        buildOptions: {} as never,
      } as unknown as Parameters<
        FlatPermissionFlagDefinitionValidatorService['validateFlatPermissionFlagDefinitionDeletion']
      >[0]);

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_NOT_FOUND,
      ]);
    });

    it('rejects deleting a standard definition from a custom application', () => {
      const existing = buildFlatDefinition({
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION.universalIdentifier,
      });
      const optimisticMaps = buildEmptyMaps();
      optimisticMaps.byUniversalIdentifier[existing.universalIdentifier] =
        existing;

      const result = service.validateFlatPermissionFlagDefinitionDeletion({
        flatEntityToValidate: existing,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatPermissionFlagDefinitionMaps: optimisticMaps,
          flatPermissionFlagMaps: buildEmptyPermissionFlagMaps(),
        },
        buildOptions: {
          isSystemBuild: false,
          applicationUniversalIdentifier:
            '00000000-0000-0000-0000-000000000aaa',
        },
      } as unknown as Parameters<
        FlatPermissionFlagDefinitionValidatorService['validateFlatPermissionFlagDefinitionDeletion']
      >[0]);

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_IS_STANDARD,
      ]);
    });

    it('rejects deleting a definition while roles still grant its key', () => {
      const existing = buildFlatDefinition({
        key: PermissionFlagType.WORKSPACE,
      });
      const optimisticMaps = buildEmptyMaps();
      optimisticMaps.byUniversalIdentifier[existing.universalIdentifier] =
        existing;

      const permissionFlagMaps = buildEmptyPermissionFlagMaps();
      const permissionFlag = buildFlatPermissionFlag({
        flag: PermissionFlagType.WORKSPACE,
      });
      permissionFlagMaps.byUniversalIdentifier[
        permissionFlag.universalIdentifier
      ] = permissionFlag;

      const result = service.validateFlatPermissionFlagDefinitionDeletion({
        flatEntityToValidate: existing,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatPermissionFlagDefinitionMaps: optimisticMaps,
          flatPermissionFlagMaps: permissionFlagMaps,
        },
        buildOptions: {
          isSystemBuild: false,
          applicationUniversalIdentifier:
            '00000000-0000-0000-0000-000000000aaa',
        },
      } as unknown as Parameters<
        FlatPermissionFlagDefinitionValidatorService['validateFlatPermissionFlagDefinitionDeletion']
      >[0]);

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_IN_USE,
      ]);
    });
  });

  // ALL_METADATA_NAME is referenced as a sanity check the metadata name exists
  it('uses the registered ALL_METADATA_NAME entry', () => {
    expect(ALL_METADATA_NAME.permissionFlagDefinition).toBe(
      'permissionFlagDefinition',
    );
  });
});
