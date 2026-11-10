import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { validateFieldMetadataNotUsedByRowLevelPermissionPredicateCrossEntity } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-field-metadata-not-used-by-row-level-permission-predicate-cross-entity.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const COMPANY_OBJECT_UNIVERSAL_IDENTIFIER = 'company-object';
const TERRITORY_FIELD_UNIVERSAL_IDENTIFIER = 'territory-field';
const PREDICATE_UNIVERSAL_IDENTIFIER = 'territory-predicate';

type PredicateReferenceProperty =
  | 'rowLevelPermissionPredicateUniversalIdentifiers'
  | 'relationRowLevelPermissionPredicateUniversalIdentifiers'
  | 'workspaceMemberRowLevelPermissionPredicateUniversalIdentifiers';

const buildTerritoryField = (
  referenceProperty: PredicateReferenceProperty | null,
) => ({
  universalIdentifier: TERRITORY_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'territory',
  objectMetadataUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
  rowLevelPermissionPredicateUniversalIdentifiers: [],
  relationRowLevelPermissionPredicateUniversalIdentifiers: [],
  workspaceMemberRowLevelPermissionPredicateUniversalIdentifiers: [],
  ...(referenceProperty === null
    ? {}
    : { [referenceProperty]: [PREDICATE_UNIVERSAL_IDENTIFIER] }),
});

const buildDeleteActions = (universalIdentifiers: string[]) =>
  universalIdentifiers.map((universalIdentifier) => ({ universalIdentifier }));

const validate = ({
  referenceProperty = 'rowLevelPermissionPredicateUniversalIdentifiers',
  deletedPredicateUniversalIdentifiers = [],
  deletedObjectUniversalIdentifiers = [],
}: {
  referenceProperty?: PredicateReferenceProperty | null;
  deletedPredicateUniversalIdentifiers?: string[];
  deletedObjectUniversalIdentifiers?: string[];
}) =>
  validateFieldMetadataNotUsedByRowLevelPermissionPredicateCrossEntity({
    fromFlatFieldMetadataMaps: {
      ...createEmptyFlatEntityMaps(),
      byUniversalIdentifier: {
        [TERRITORY_FIELD_UNIVERSAL_IDENTIFIER]: buildTerritoryField(
          referenceProperty,
        ) as unknown as UniversalFlatFieldMetadata,
      },
    },
    orchestratorActionsReport: {
      fieldMetadata: {
        delete: buildDeleteActions([TERRITORY_FIELD_UNIVERSAL_IDENTIFIER]),
      },
      rowLevelPermissionPredicate: {
        delete: buildDeleteActions(deletedPredicateUniversalIdentifiers),
      },
      objectMetadata: {
        delete: buildDeleteActions(deletedObjectUniversalIdentifiers),
      },
    } as never,
  }).fieldMetadata;

describe('validateFieldMetadataNotUsedByRowLevelPermissionPredicateCrossEntity', () => {
  it('accepts deleting a field no row-level permission predicate uses', () => {
    expect(validate({ referenceProperty: null })).toEqual([]);
  });

  it.each([
    'rowLevelPermissionPredicateUniversalIdentifiers',
    'relationRowLevelPermissionPredicateUniversalIdentifiers',
    'workspaceMemberRowLevelPermissionPredicateUniversalIdentifiers',
  ] as const)(
    'rejects deleting a field a predicate references through %s',
    (referenceProperty) => {
      const errors = validate({ referenceProperty });

      expect(errors).toHaveLength(1);
      expect(errors[0].errors).toEqual([
        expect.objectContaining({
          code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        }),
      ]);
    },
  );

  it('accepts the deletion when the predicate is deleted in the same migration', () => {
    expect(
      validate({
        deletedPredicateUniversalIdentifiers: [PREDICATE_UNIVERSAL_IDENTIFIER],
      }),
    ).toEqual([]);
  });

  it('accepts the deletion when the field object is deleted in the same migration', () => {
    expect(
      validate({
        deletedObjectUniversalIdentifiers: [
          COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
        ],
      }),
    ).toEqual([]);
  });
});
