import { Test, type TestingModule } from '@nestjs/testing';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag.type';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { type PermissionFlagPermissionType } from 'src/engine/metadata-modules/permission-flag/constants/permission-flag-permission-type.constant';
import { PermissionFlagExceptionCode } from 'src/engine/metadata-modules/permission-flag/permission-flag.exception';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { FlatPermissionFlagValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-permission-flag-validator.service';

const buildFlatDefinition = (
  overrides: Partial<FlatPermissionFlag> = {},
): FlatPermissionFlag =>
  ({
    id: '00000000-0000-0000-0000-000000000001',
    universalIdentifier: '00000000-0000-0000-0000-000000000001',
    key: 'TEST_FLAG',
    label: 'Test Flag',
    description: 'A flag for tests',
    icon: 'IconTest',
    permissionType: 'tool',
    workspaceId: 'workspace-id',
    applicationId: '00000000-0000-0000-0000-000000000aaa',
    applicationUniversalIdentifier: '00000000-0000-0000-0000-000000000aaa',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }) as unknown as FlatPermissionFlag;

const buildEmptyMaps = (): FlatEntityMaps<FlatPermissionFlag> =>
  createEmptyFlatEntityMaps() as unknown as FlatEntityMaps<FlatPermissionFlag>;

const buildEmptyRolePermissionFlagMaps =
  (): FlatEntityMaps<FlatRolePermissionFlag> =>
    createEmptyFlatEntityMaps() as unknown as FlatEntityMaps<FlatRolePermissionFlag>;

const buildArgs = (
  flatEntityToValidate: FlatPermissionFlag,
  optimisticMaps: FlatEntityMaps<FlatPermissionFlag> = buildEmptyMaps(),
) =>
  ({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPermissionFlagMaps: optimisticMaps,
    },
    buildOptions: {} as never,
  }) as unknown as Parameters<
    FlatPermissionFlagValidatorService['validateFlatPermissionFlagCreation']
  >[0];

describe('FlatPermissionFlagValidatorService', () => {
  let service: FlatPermissionFlagValidatorService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [FlatPermissionFlagValidatorService],
    }).compile();

    service = moduleRef.get(FlatPermissionFlagValidatorService);
  });

  describe('validateFlatPermissionFlagCreation', () => {
    it('passes for a valid definition', () => {
      const result = service.validateFlatPermissionFlagCreation(
        buildArgs(buildFlatDefinition()),
      );

      expect(result.errors).toHaveLength(0);
    });

    it('rejects an empty key', () => {
      const result = service.validateFlatPermissionFlagCreation(
        buildArgs(buildFlatDefinition({ key: '' })),
      );

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_KEY,
      ]);
    });

    it('rejects an unknown permission type', () => {
      const result = service.validateFlatPermissionFlagCreation(
        buildArgs(
          buildFlatDefinition({
            permissionType: 'invalid' as PermissionFlagPermissionType,
          }),
        ),
      );

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_PERMISSION_TYPE,
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

      const result = service.validateFlatPermissionFlagCreation(
        buildArgs(buildFlatDefinition({ key: 'EXISTING_KEY' }), optimisticMaps),
      );

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagExceptionCode.PERMISSION_FLAG_ALREADY_EXISTS,
      ]);
    });

    it('rejects a duplicate universal identifier', () => {
      const existing = buildFlatDefinition();
      const optimisticMaps = buildEmptyMaps();
      optimisticMaps.byUniversalIdentifier[existing.universalIdentifier] =
        existing;

      const result = service.validateFlatPermissionFlagCreation(
        buildArgs(
          buildFlatDefinition({
            id: '00000000-0000-0000-0000-000000000002',
            key: 'ANOTHER_TEST_FLAG',
          }),
          optimisticMaps,
        ),
      );

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagExceptionCode.PERMISSION_FLAG_ALREADY_EXISTS,
      ]);
    });
  });

  describe('validateFlatPermissionFlagUpdate', () => {
    it('passes for a valid update', () => {
      const existing = buildFlatDefinition();
      const optimisticMaps = buildEmptyMaps();
      optimisticMaps.byUniversalIdentifier[existing.universalIdentifier] =
        existing;

      const result = service.validateFlatPermissionFlagUpdate({
        universalIdentifier: existing.universalIdentifier,
        flatEntityUpdate: { label: 'Updated Label' },
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatPermissionFlagMaps: optimisticMaps,
        },
        buildOptions: {} as never,
      } as unknown as Parameters<
        FlatPermissionFlagValidatorService['validateFlatPermissionFlagUpdate']
      >[0]);

      expect(result.errors).toHaveLength(0);
    });

    it('rejects updating the immutable key field', () => {
      const existing = buildFlatDefinition({ key: 'ORIGINAL_KEY' });
      const optimisticMaps = buildEmptyMaps();
      optimisticMaps.byUniversalIdentifier[existing.universalIdentifier] =
        existing;

      const result = service.validateFlatPermissionFlagUpdate({
        universalIdentifier: existing.universalIdentifier,
        flatEntityUpdate: { key: 'NEW_KEY' },
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatPermissionFlagMaps: optimisticMaps,
        },
        buildOptions: {} as never,
      } as unknown as Parameters<
        FlatPermissionFlagValidatorService['validateFlatPermissionFlagUpdate']
      >[0]);

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagExceptionCode.PERMISSION_FLAG_KEY_IMMUTABLE,
      ]);
    });

    it('returns not-found if no existing definition matches the universalIdentifier', () => {
      const result = service.validateFlatPermissionFlagUpdate({
        universalIdentifier: '00000000-0000-0000-0000-deadbeefdead',
        flatEntityUpdate: { label: 'New Label' },
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatPermissionFlagMaps: buildEmptyMaps(),
        },
        buildOptions: {} as never,
      } as unknown as Parameters<
        FlatPermissionFlagValidatorService['validateFlatPermissionFlagUpdate']
      >[0]);

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagExceptionCode.PERMISSION_FLAG_NOT_FOUND,
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

      const result = service.validateFlatPermissionFlagUpdate({
        universalIdentifier: existing.universalIdentifier,
        flatEntityUpdate: { label: 'Updated Label' },
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatPermissionFlagMaps: optimisticMaps,
        },
        buildOptions: {
          isSystemBuild: false,
          applicationUniversalIdentifier:
            '00000000-0000-0000-0000-000000000aaa',
        },
      } as unknown as Parameters<
        FlatPermissionFlagValidatorService['validateFlatPermissionFlagUpdate']
      >[0]);

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagExceptionCode.PERMISSION_FLAG_IS_STANDARD,
      ]);
    });

    it('rejects updating to an unknown permission type', () => {
      const existing = buildFlatDefinition();
      const optimisticMaps = buildEmptyMaps();
      optimisticMaps.byUniversalIdentifier[existing.universalIdentifier] =
        existing;

      const result = service.validateFlatPermissionFlagUpdate({
        universalIdentifier: existing.universalIdentifier,
        flatEntityUpdate: {
          permissionType: 'invalid' as PermissionFlagPermissionType,
        },
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatPermissionFlagMaps: optimisticMaps,
        },
        buildOptions: {} as never,
      } as unknown as Parameters<
        FlatPermissionFlagValidatorService['validateFlatPermissionFlagUpdate']
      >[0]);

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_PERMISSION_TYPE,
      ]);
    });
  });

  describe('validateFlatPermissionFlagDeletion', () => {
    it('passes for a valid deletion', () => {
      const existing = buildFlatDefinition();
      const optimisticMaps = buildEmptyMaps();
      optimisticMaps.byUniversalIdentifier[existing.universalIdentifier] =
        existing;

      const result = service.validateFlatPermissionFlagDeletion({
        flatEntityToValidate: existing,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatPermissionFlagMaps: optimisticMaps,
          flatRolePermissionFlagMaps: buildEmptyRolePermissionFlagMaps(),
        },
        buildOptions: {} as never,
      } as unknown as Parameters<
        FlatPermissionFlagValidatorService['validateFlatPermissionFlagDeletion']
      >[0]);

      expect(result.errors).toHaveLength(0);
    });

    it('returns not-found if no existing definition matches the universalIdentifier', () => {
      const result = service.validateFlatPermissionFlagDeletion({
        flatEntityToValidate: buildFlatDefinition({
          universalIdentifier: '00000000-0000-0000-0000-deadbeefdead',
        }),
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatPermissionFlagMaps: buildEmptyMaps(),
          flatRolePermissionFlagMaps: buildEmptyRolePermissionFlagMaps(),
        },
        buildOptions: {} as never,
      } as unknown as Parameters<
        FlatPermissionFlagValidatorService['validateFlatPermissionFlagDeletion']
      >[0]);

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagExceptionCode.PERMISSION_FLAG_NOT_FOUND,
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

      const result = service.validateFlatPermissionFlagDeletion({
        flatEntityToValidate: existing,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatPermissionFlagMaps: optimisticMaps,
          flatRolePermissionFlagMaps: buildEmptyRolePermissionFlagMaps(),
        },
        buildOptions: {
          isSystemBuild: false,
          applicationUniversalIdentifier:
            '00000000-0000-0000-0000-000000000aaa',
        },
      } as unknown as Parameters<
        FlatPermissionFlagValidatorService['validateFlatPermissionFlagDeletion']
      >[0]);

      expect(result.errors.map((error) => error.code)).toEqual([
        PermissionFlagExceptionCode.PERMISSION_FLAG_IS_STANDARD,
      ]);
    });
  });

  // ALL_METADATA_NAME is referenced as a sanity check the metadata name exists
  it('uses the registered ALL_METADATA_NAME entry', () => {
    expect(ALL_METADATA_NAME.permissionFlag).toBe('permissionFlag');
  });
});
