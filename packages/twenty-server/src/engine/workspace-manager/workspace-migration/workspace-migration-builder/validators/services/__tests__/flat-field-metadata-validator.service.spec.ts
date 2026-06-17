import { Test, type TestingModule } from '@nestjs/testing';

import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { FlatFieldMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-field-metadata-validator.service';

const buildFlatFieldMetadata = (
  overrides: Partial<UniversalFlatFieldMetadata> = {},
): UniversalFlatFieldMetadata =>
  ({
    universalIdentifier: 'field-universal-id',
    name: 'relationField',
    label: 'Relation Field',
    description: 'Field description',
    type: FieldMetadataType.RELATION,
    objectMetadataUniversalIdentifier: 'object-universal-id',
    relationTargetObjectMetadataUniversalIdentifier: 'target-object-universal-id',
    isNullable: false,
    defaultValue: null,
    isLabelSyncedWithName: false,
    isActive: true,
    isSystem: false,
    universalSettings: null,
    standardOverrides: null,
    icon: 'IconSettings',
    ...overrides,
  }) as unknown as UniversalFlatFieldMetadata;

const buildFlatObjectMetadata = (overrides: Record<string, unknown> = {}) =>
  ({
    universalIdentifier: 'object-universal-id',
    labelIdentifierFieldMetadataUniversalIdentifier: 'label-field-universal-id',
    ...overrides,
  }) as never;

describe('FlatFieldMetadataValidatorService', () => {
  let service: FlatFieldMetadataValidatorService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FlatFieldMetadataValidatorService,
        {
          provide: FlatFieldMetadataTypeValidatorService,
          useValue: {
            validateFlatFieldMetadataTypeSpecificities: jest
              .fn()
              .mockReturnValue([]),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(FlatFieldMetadataValidatorService);
  });

  it('does not reject required relation field updates when defaultValue is null', () => {
    const existingField = buildFlatFieldMetadata();
    const flatFieldMetadataMaps = createEmptyFlatEntityMaps() as never;
    const flatObjectMetadataMaps = createEmptyFlatEntityMaps() as never;

    flatFieldMetadataMaps.byUniversalIdentifier[existingField.universalIdentifier] =
      existingField;
    flatObjectMetadataMaps.byUniversalIdentifier[
      existingField.objectMetadataUniversalIdentifier
    ] = buildFlatObjectMetadata();

    const result = service.validateFlatFieldMetadataUpdate({
      universalIdentifier: existingField.universalIdentifier,
      flatEntityUpdate: {
        description: 'Updated description',
      },
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      },
      workspaceId: 'workspace-id',
      buildOptions: {
        isSystemBuild: false,
        applicationUniversalIdentifier: 'application-universal-id',
      },
      additionalCacheDataMaps: createEmptyFlatEntityMaps() as never,
    } as never);

    expect(
      result.errors.find(
        (error) => error.code === FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      ),
    ).toBeUndefined();
  });

  it('keeps rejecting required non-relation fields when defaultValue is null', () => {
    const existingField = buildFlatFieldMetadata({
      type: FieldMetadataType.TEXT,
      name: 'textField',
    });
    const flatFieldMetadataMaps = createEmptyFlatEntityMaps() as never;
    const flatObjectMetadataMaps = createEmptyFlatEntityMaps() as never;

    flatFieldMetadataMaps.byUniversalIdentifier[existingField.universalIdentifier] =
      existingField;
    flatObjectMetadataMaps.byUniversalIdentifier[
      existingField.objectMetadataUniversalIdentifier
    ] = buildFlatObjectMetadata();

    const result = service.validateFlatFieldMetadataUpdate({
      universalIdentifier: existingField.universalIdentifier,
      flatEntityUpdate: {
        description: 'Updated description',
      },
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      },
      workspaceId: 'workspace-id',
      buildOptions: {
        isSystemBuild: false,
        applicationUniversalIdentifier: 'application-universal-id',
      },
      additionalCacheDataMaps: createEmptyFlatEntityMaps() as never,
    } as never);

    expect(result.errors.map((error) => error.code)).toContain(
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );
  });
});
