import { isDefined } from 'twenty-shared/utils';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { validateFieldMetadataNotUsedByRowLevelPermissionPredicateCrossEntity } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-field-metadata-not-used-by-row-level-permission-predicate-cross-entity.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const COMPANY_OBJECT_UNIVERSAL_IDENTIFIER = 'company-object';
const TERRITORY_FIELD_UNIVERSAL_IDENTIFIER = 'territory-field';
const PREDICATE_UNIVERSAL_IDENTIFIER = 'territory-predicate';
const ROLE_UNIVERSAL_IDENTIFIER = 'sales-role';

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
  ...(isDefined(referenceProperty)
    ? { [referenceProperty]: [PREDICATE_UNIVERSAL_IDENTIFIER] }
    : {}),
});

const buildDeleteActions = (universalIdentifiers: string[]) =>
  universalIdentifiers.map((universalIdentifier) => ({ universalIdentifier }));

const validate = ({
  referenceProperty = 'rowLevelPermissionPredicateUniversalIdentifiers',
  deletedPredicateUniversalIdentifiers = [],
  deletedRoleUniversalIdentifiers = [],
  deletedObjectUniversalIdentifiers = [],
  isPredicateInMigrationMaps = false,
}: {
  referenceProperty?: PredicateReferenceProperty | null;
  deletedPredicateUniversalIdentifiers?: string[];
  deletedRoleUniversalIdentifiers?: string[];
  deletedObjectUniversalIdentifiers?: string[];
  isPredicateInMigrationMaps?: boolean;
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
    optimisticUniversalFlatMaps: {
      flatRowLevelPermissionPredicateMaps: {
        ...createEmptyFlatEntityMaps(),
        byUniversalIdentifier: isPredicateInMigrationMaps
          ? {
              [PREDICATE_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier: PREDICATE_UNIVERSAL_IDENTIFIER,
                roleUniversalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
                objectMetadataUniversalIdentifier:
                  COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
              },
            }
          : {},
      } as never,
    },
    orchestratorActionsReport: {
      fieldMetadata: {
        delete: buildDeleteActions([TERRITORY_FIELD_UNIVERSAL_IDENTIFIER]),
      },
      rowLevelPermissionPredicate: {
        delete: buildDeleteActions(deletedPredicateUniversalIdentifiers),
      },
      role: { delete: buildDeleteActions(deletedRoleUniversalIdentifiers) },
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

  it('accepts the deletion when the predicate role is deleted in the same migration', () => {
    expect(
      validate({
        isPredicateInMigrationMaps: true,
        deletedRoleUniversalIdentifiers: [ROLE_UNIVERSAL_IDENTIFIER],
      }),
    ).toEqual([]);
  });

  it('rejects the deletion when the role of a predicate outside the migration maps is not deleted', () => {
    expect(
      validate({
        deletedRoleUniversalIdentifiers: [ROLE_UNIVERSAL_IDENTIFIER],
      }),
    ).toHaveLength(1);
  });
});
