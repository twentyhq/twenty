import { FieldMetadataType, RelationType, ViewType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { FlatViewFieldValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-field-validator.service';

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER = 'person-object';
const COMPANY_OBJECT_UNIVERSAL_IDENTIFIER = 'company-object';
const VIEW_UNIVERSAL_IDENTIFIER = 'person-view';

const personNameField = getFlatFieldMetadataMock({
  id: 'person-name-id',
  universalIdentifier: 'person-name',
  objectMetadataId: 'person-object-id',
  objectMetadataUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldMetadataType.FULL_NAME,
});

const personCompanyRelationField = getFlatFieldMetadataMock({
  id: 'person-company-id',
  universalIdentifier: 'person-company',
  objectMetadataId: 'person-object-id',
  objectMetadataUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetObjectMetadataUniversalIdentifier:
    COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldMetadataType.RELATION,
  universalSettings: { relationType: RelationType.MANY_TO_ONE },
});

const companyEmployeesField = getFlatFieldMetadataMock({
  id: 'company-employees-id',
  universalIdentifier: 'company-employees',
  objectMetadataId: 'company-object-id',
  objectMetadataUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldMetadataType.NUMBER,
});

const companyNameField = getFlatFieldMetadataMock({
  id: 'company-name-id',
  universalIdentifier: 'company-name',
  objectMetadataId: 'company-object-id',
  objectMetadataUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldMetadataType.TEXT,
});

const personObject = {
  universalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
  labelIdentifierFieldMetadataUniversalIdentifier:
    personNameField.universalIdentifier,
} as FlatObjectMetadata;

const buildViewField = (
  overrides: Partial<UniversalFlatViewField> &
    Pick<UniversalFlatViewField, 'universalIdentifier'>,
): UniversalFlatViewField =>
  ({
    viewUniversalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
    fieldMetadataUniversalIdentifier:
      personCompanyRelationField.universalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier: null,
    position: 1,
    isVisible: true,
    ...overrides,
  }) as UniversalFlatViewField;

const buildCreationArgs = ({
  flatViewFieldToValidate,
  existingFlatViewFields,
}: {
  flatViewFieldToValidate: UniversalFlatViewField;
  existingFlatViewFields: FlatViewField[];
}): UniversalFlatEntityValidationArgs<'viewField'> => {
  const flatView = {
    universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
    objectMetadataUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
    type: ViewType.TABLE,
    viewFieldUniversalIdentifiers: existingFlatViewFields.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
  } as FlatView;

  const addAll = <T extends SyncableFlatEntity>(
    flatEntities: T[],
  ): FlatEntityMaps<T> =>
    flatEntities.reduce<FlatEntityMaps<T>>(
      (flatEntityMaps, flatEntity) =>
        addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
      createEmptyFlatEntityMaps(),
    );

  return {
    flatEntityToValidate: flatViewFieldToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFieldMaps: addAll(existingFlatViewFields),
      flatFieldMetadataMaps: addAll<FlatFieldMetadata>([
        personNameField,
        personCompanyRelationField,
        companyEmployeesField,
        companyNameField,
      ]),
      flatViewMaps: addAll([flatView]),
      flatObjectMetadataMaps: addAll([personObject]),
      flatViewFieldGroupMaps: createEmptyFlatEntityMaps(),
    },
  } as unknown as UniversalFlatEntityValidationArgs<'viewField'>;
};

describe('FlatViewFieldValidatorService relation traversal', () => {
  const service = new FlatViewFieldValidatorService();

  const labelIdentifierViewField = buildViewField({
    universalIdentifier: 'label-view-field',
    fieldMetadataUniversalIdentifier: personNameField.universalIdentifier,
    position: 0,
  }) as FlatViewField;

  it('accepts a traversed view field next to the plain relation column', () => {
    const plainRelationViewField = buildViewField({
      universalIdentifier: 'relation-view-field',
      position: 1,
    }) as FlatViewField;

    const result = service.validateFlatViewFieldCreation(
      buildCreationArgs({
        flatViewFieldToValidate: buildViewField({
          universalIdentifier: 'traversed-view-field',
          relationTargetFieldMetadataUniversalIdentifier:
            companyEmployeesField.universalIdentifier,
          position: 2,
        }),
        existingFlatViewFields: [
          labelIdentifierViewField,
          plainRelationViewField,
        ],
      }),
    );

    expect(result.errors).toEqual([]);
  });

  it('accepts two traversed view fields on the same relation with different targets', () => {
    const employeesViewField = buildViewField({
      universalIdentifier: 'employees-view-field',
      relationTargetFieldMetadataUniversalIdentifier:
        companyEmployeesField.universalIdentifier,
      position: 1,
    }) as FlatViewField;

    const result = service.validateFlatViewFieldCreation(
      buildCreationArgs({
        flatViewFieldToValidate: buildViewField({
          universalIdentifier: 'company-name-view-field',
          relationTargetFieldMetadataUniversalIdentifier:
            companyNameField.universalIdentifier,
          position: 2,
        }),
        existingFlatViewFields: [labelIdentifierViewField, employeesViewField],
      }),
    );

    expect(result.errors).toEqual([]);
  });

  it('rejects a duplicate (view, fieldMetadata, relationTargetFieldMetadata) triple', () => {
    const employeesViewField = buildViewField({
      universalIdentifier: 'employees-view-field',
      relationTargetFieldMetadataUniversalIdentifier:
        companyEmployeesField.universalIdentifier,
      position: 1,
    }) as FlatViewField;

    const result = service.validateFlatViewFieldCreation(
      buildCreationArgs({
        flatViewFieldToValidate: buildViewField({
          universalIdentifier: 'duplicate-view-field',
          relationTargetFieldMetadataUniversalIdentifier:
            companyEmployeesField.universalIdentifier,
          position: 2,
        }),
        existingFlatViewFields: [labelIdentifierViewField, employeesViewField],
      }),
    );

    expect(result.errors).toEqual([
      expect.objectContaining({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message:
          'View field with same fieldMetadataUniversalIdentifier, relationTargetFieldMetadataUniversalIdentifier and viewUniversalIdentifier already exists',
      }),
    ]);
  });

  it('rejects a traversed view field whose target is on another object', () => {
    const result = service.validateFlatViewFieldCreation(
      buildCreationArgs({
        flatViewFieldToValidate: buildViewField({
          universalIdentifier: 'traversed-view-field',
          relationTargetFieldMetadataUniversalIdentifier:
            personNameField.universalIdentifier,
          position: 2,
        }),
        existingFlatViewFields: [labelIdentifierViewField],
      }),
    );

    expect(result.errors).toEqual([
      expect.objectContaining({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message:
          'Relation target field does not belong to the object the relation points to',
      }),
    ]);
  });

  it('rejects traversing the label identifier field', () => {
    const result = service.validateFlatViewFieldCreation(
      buildCreationArgs({
        flatViewFieldToValidate: buildViewField({
          universalIdentifier: 'traversed-label-view-field',
          fieldMetadataUniversalIdentifier: personNameField.universalIdentifier,
          relationTargetFieldMetadataUniversalIdentifier:
            companyEmployeesField.universalIdentifier,
          position: 2,
        }),
        existingFlatViewFields: [labelIdentifierViewField],
      }),
    );

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: 'Label identifier field cannot be traversed',
        }),
      ]),
    );
  });

  it('still enforces the label identifier first rule against traversed fields', () => {
    const result = service.validateFlatViewFieldCreation(
      buildCreationArgs({
        flatViewFieldToValidate: buildViewField({
          universalIdentifier: 'traversed-view-field',
          relationTargetFieldMetadataUniversalIdentifier:
            companyEmployeesField.universalIdentifier,
          position: -1,
        }),
        existingFlatViewFields: [labelIdentifierViewField],
      }),
    );

    expect(result.errors).toEqual([
      expect.objectContaining({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message:
          'View field position cannot be lower than label identifier view field position',
      }),
    ]);
  });
});
