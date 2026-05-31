import { Test, type TestingModule } from '@nestjs/testing';

import { FieldMetadataType } from 'twenty-shared/types';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { MAX_CUSTOM_INDEXES_PER_OBJECT } from 'twenty-shared/constants';
import {
  IndexMetadataException,
  IndexMetadataExceptionCode,
} from 'src/engine/metadata-modules/index-metadata/index-field-metadata.exception';
import { IndexMetadataService } from 'src/engine/metadata-modules/index-metadata/services/index-metadata.service';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = 'workspace-id';
const OBJECT_ID = 'object-id';
const OBJECT_UNIVERSAL_ID = 'object-universal-id';
const APPLICATION_UNIVERSAL_ID = 'app-universal-id';

const buildFlatObjectMetadataMaps = () => {
  const maps = createEmptyFlatEntityMaps() as ReturnType<
    typeof createEmptyFlatEntityMaps
  > & {
    byUniversalIdentifier: Record<string, unknown>;
    universalIdentifierById: Record<string, string>;
  };

  maps.byUniversalIdentifier = {
    [OBJECT_UNIVERSAL_ID]: {
      id: OBJECT_ID,
      universalIdentifier: OBJECT_UNIVERSAL_ID,
      nameSingular: 'company',
      isCustom: false,
    },
  };
  maps.universalIdentifierById = { [OBJECT_ID]: OBJECT_UNIVERSAL_ID };

  return maps;
};

const buildFlatFieldMetadataMaps = (
  fields: {
    id: string;
    universalIdentifier: string;
    name: string;
    type?: FieldMetadataType;
  }[],
) => {
  const maps = createEmptyFlatEntityMaps() as ReturnType<
    typeof createEmptyFlatEntityMaps
  > & {
    byUniversalIdentifier: Record<string, unknown>;
    universalIdentifierById: Record<string, string>;
  };

  for (const field of fields) {
    maps.byUniversalIdentifier[field.universalIdentifier] = {
      id: field.id,
      universalIdentifier: field.universalIdentifier,
      name: field.name,
      label: field.name,
      type: field.type ?? FieldMetadataType.TEXT,
      objectMetadataId: OBJECT_ID,
      isUnique: false,
      isCustom: true,
      isActive: true,
      isSystem: false,
      isNullable: true,
    };
    maps.universalIdentifierById[field.id] = field.universalIdentifier;
  }

  return maps;
};

const buildFlatIndexMaps = (
  indexes: Array<{
    id: string;
    universalIdentifier: string;
    isCustom: boolean;
  }>,
) => {
  const maps = createEmptyFlatEntityMaps() as ReturnType<
    typeof createEmptyFlatEntityMaps
  > & {
    byUniversalIdentifier: Record<string, unknown>;
    universalIdentifierById: Record<string, string>;
  };

  for (const index of indexes) {
    maps.byUniversalIdentifier[index.universalIdentifier] =
      getFlatIndexMetadataMock({
        id: index.id,
        universalIdentifier: index.universalIdentifier,
        objectMetadataId: OBJECT_ID,
        objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_ID,
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_ID,
        isCustom: index.isCustom,
      });
    maps.universalIdentifierById[index.id] = index.universalIdentifier;
  }

  return maps;
};

describe('IndexMetadataService', () => {
  let service: IndexMetadataService;
  let cacheService: jest.Mocked<WorkspaceManyOrAllFlatEntityMapsCacheService>;
  let migrationService: jest.Mocked<WorkspaceMigrationValidateBuildAndRunService>;
  let applicationService: jest.Mocked<ApplicationService>;

  const setupCacheReturn = ({
    fieldIds = [],
    customIndexCount = 0,
  }: {
    fieldIds?: {
      id: string;
      universalIdentifier: string;
      name: string;
      type?: FieldMetadataType;
    }[];
    customIndexCount?: number;
  } = {}) => {
    const indexes = Array.from({ length: customIndexCount }).map((_, i) => ({
      id: `idx-${i}`,
      universalIdentifier: `idx-universal-${i}`,
      isCustom: true,
    }));

    cacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue({
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps(),
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps(fieldIds),
      flatIndexMaps: buildFlatIndexMaps(indexes),
      // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndexMetadataService,
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps: jest.fn(),
            invalidateFlatEntityMaps: jest.fn(),
          },
        },
        {
          provide: WorkspaceMigrationValidateBuildAndRunService,
          useValue: {
            validateBuildAndRunWorkspaceMigration: jest
              .fn()
              .mockResolvedValue({ status: 'success' }),
          },
        },
        {
          provide: ApplicationService,
          useValue: {
            findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
              .fn()
              .mockResolvedValue({
                workspaceCustomFlatApplication: {
                  universalIdentifier: APPLICATION_UNIVERSAL_ID,
                },
              }),
          },
        },
      ],
    }).compile();

    service = module.get(IndexMetadataService);
    cacheService = module.get(WorkspaceManyOrAllFlatEntityMapsCacheService);
    migrationService = module.get(WorkspaceMigrationValidateBuildAndRunService);
    applicationService = module.get(ApplicationService);
  });

  describe('createOne validation', () => {
    it('rejects empty fields', async () => {
      setupCacheReturn();

      await expect(
        service.createOne({
          workspaceId: WORKSPACE_ID,
          createIndexInput: {
            objectMetadataId: OBJECT_ID,
            fields: [],
            indexType: IndexType.BTREE,
          },
        }),
      ).rejects.toMatchObject({
        code: IndexMetadataExceptionCode.INDEX_FIELDS_REQUIRED,
      });
    });

    it('rejects duplicate (fieldMetadataId + subFieldName) pairs', async () => {
      setupCacheReturn();

      await expect(
        service.createOne({
          workspaceId: WORKSPACE_ID,
          createIndexInput: {
            objectMetadataId: OBJECT_ID,
            fields: [
              { fieldMetadataId: 'field-1' },
              { fieldMetadataId: 'field-1' },
            ],
            indexType: IndexType.BTREE,
          },
        }),
      ).rejects.toMatchObject({
        code: IndexMetadataExceptionCode.DUPLICATE_INDEX_FIELDS,
      });
    });

    it('rejects when object does not exist', async () => {
      setupCacheReturn();

      await expect(
        service.createOne({
          workspaceId: WORKSPACE_ID,
          createIndexInput: {
            objectMetadataId: 'unknown-object',
            fields: [{ fieldMetadataId: 'field-1' }],
            indexType: IndexType.BTREE,
          },
        }),
      ).rejects.toMatchObject({
        code: IndexMetadataExceptionCode.INDEX_OBJECT_NOT_FOUND,
      });
    });

    it('rejects composite-type fields without subFieldName', async () => {
      setupCacheReturn({
        fieldIds: [
          {
            id: 'field-currency',
            universalIdentifier: 'field-currency-universal',
            name: 'annualRecurringRevenue',
            type: FieldMetadataType.CURRENCY,
          },
        ],
      });

      await expect(
        service.createOne({
          workspaceId: WORKSPACE_ID,
          createIndexInput: {
            objectMetadataId: OBJECT_ID,
            fields: [{ fieldMetadataId: 'field-currency' }],
            indexType: IndexType.BTREE,
          },
        }),
      ).rejects.toMatchObject({
        code: IndexMetadataExceptionCode.INDEX_NOT_SUPPORTED_FOR_COMPOSITE_FIELD,
      });

      expect(
        migrationService.validateBuildAndRunWorkspaceMigration,
      ).not.toHaveBeenCalled();
    });

    it('rejects composite-type fields with an unknown subFieldName', async () => {
      setupCacheReturn({
        fieldIds: [
          {
            id: 'field-currency',
            universalIdentifier: 'field-currency-universal',
            name: 'annualRecurringRevenue',
            type: FieldMetadataType.CURRENCY,
          },
        ],
      });

      await expect(
        service.createOne({
          workspaceId: WORKSPACE_ID,
          createIndexInput: {
            objectMetadataId: OBJECT_ID,
            fields: [
              {
                fieldMetadataId: 'field-currency',
                subFieldName: 'notARealProp',
              },
            ],
            indexType: IndexType.BTREE,
          },
        }),
      ).rejects.toMatchObject({
        code: IndexMetadataExceptionCode.INDEX_NOT_SUPPORTED_FOR_COMPOSITE_FIELD,
      });
    });

    it('rejects subFieldName on a scalar field', async () => {
      setupCacheReturn({
        fieldIds: [
          {
            id: 'field-text',
            universalIdentifier: 'field-text-universal',
            name: 'someText',
            type: FieldMetadataType.TEXT,
          },
        ],
      });

      await expect(
        service.createOne({
          workspaceId: WORKSPACE_ID,
          createIndexInput: {
            objectMetadataId: OBJECT_ID,
            fields: [
              { fieldMetadataId: 'field-text', subFieldName: 'whatever' },
            ],
            indexType: IndexType.BTREE,
          },
        }),
      ).rejects.toMatchObject({
        code: IndexMetadataExceptionCode.INDEX_NOT_SUPPORTED_FOR_COMPOSITE_FIELD,
      });
    });

    it('rejects when a field does not belong to the object', async () => {
      setupCacheReturn();

      await expect(
        service.createOne({
          workspaceId: WORKSPACE_ID,
          createIndexInput: {
            objectMetadataId: OBJECT_ID,
            fields: [{ fieldMetadataId: 'unknown-field' }],
            indexType: IndexType.BTREE,
          },
        }),
      ).rejects.toMatchObject({
        code: IndexMetadataExceptionCode.INDEX_FIELD_NOT_FOUND_ON_OBJECT,
      });
    });

    it('rejects when custom index count is at the cap', async () => {
      setupCacheReturn({
        fieldIds: [
          {
            id: 'field-1',
            universalIdentifier: 'field-1-universal',
            name: 'someColumn',
          },
        ],
        customIndexCount: MAX_CUSTOM_INDEXES_PER_OBJECT,
      });

      await expect(
        service.createOne({
          workspaceId: WORKSPACE_ID,
          createIndexInput: {
            objectMetadataId: OBJECT_ID,
            fields: [{ fieldMetadataId: 'field-1' }],
            indexType: IndexType.BTREE,
          },
        }),
      ).rejects.toMatchObject({
        code: IndexMetadataExceptionCode.CUSTOM_INDEX_LIMIT_REACHED,
      });

      expect(
        applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow,
      ).not.toHaveBeenCalled();
    });
  });

  describe('deleteOne validation', () => {
    it('throws INDEX_NOT_FOUND (not the generic flat-entity error) for an unknown id', async () => {
      cacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue({
        flatIndexMaps: buildFlatIndexMaps([]),
        // oxlint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      await expect(
        service.deleteOne({ id: 'unknown-idx', workspaceId: WORKSPACE_ID }),
      ).rejects.toMatchObject({
        code: IndexMetadataExceptionCode.INDEX_NOT_FOUND,
      });

      expect(
        migrationService.validateBuildAndRunWorkspaceMigration,
      ).not.toHaveBeenCalled();
    });

    it('refuses to delete a system index', async () => {
      cacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue({
        flatIndexMaps: buildFlatIndexMaps([
          {
            id: 'system-idx',
            universalIdentifier: 'system-idx-universal',
            isCustom: false,
          },
        ]),
        // oxlint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      await expect(
        service.deleteOne({ id: 'system-idx', workspaceId: WORKSPACE_ID }),
      ).rejects.toMatchObject({
        code: IndexMetadataExceptionCode.CANNOT_DELETE_SYSTEM_INDEX,
      });

      expect(
        migrationService.validateBuildAndRunWorkspaceMigration,
      ).not.toHaveBeenCalled();
    });

    it('runs the migration when deleting a custom index', async () => {
      cacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue({
        flatIndexMaps: buildFlatIndexMaps([
          {
            id: 'custom-idx',
            universalIdentifier: 'custom-idx-universal',
            isCustom: true,
          },
        ]),
        // oxlint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      await service.deleteOne({
        id: 'custom-idx',
        workspaceId: WORKSPACE_ID,
      });

      expect(
        migrationService.validateBuildAndRunWorkspaceMigration,
      ).toHaveBeenCalledTimes(1);
      const call =
        migrationService.validateBuildAndRunWorkspaceMigration.mock.calls[0][0];
      expect(
        call.allFlatEntityOperationByMetadataName.index?.flatEntityToDelete,
      ).toHaveLength(1);
    });
  });

  it('IndexMetadataException can be thrown', () => {
    expect(
      new IndexMetadataException(
        'msg',
        IndexMetadataExceptionCode.INDEX_NOT_FOUND,
      ),
    ).toBeInstanceOf(IndexMetadataException);
  });
});
