import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { validateFieldMetadataNotUsedByRowLevelPermissionPredicateCrossEntity } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-field-metadata-not-used-by-row-level-permission-predicate-cross-entity.util';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type UniversalFlatRowLevelPermissionPredicate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate.type';

const COMPANY_OBJECT_UNIVERSAL_IDENTIFIER = 'company-object';
const TERRITORY_FIELD_UNIVERSAL_IDENTIFIER = 'territory-field';
const OTHER_FIELD_UNIVERSAL_IDENTIFIER = 'other-field';
const SALES_ROLE_UNIVERSAL_IDENTIFIER = 'sales-role';

const buildMaps = <TUniversalFlatEntity extends UniversalSyncableFlatEntity>(
  entities: TUniversalFlatEntity[],
): UniversalFlatEntityMaps<TUniversalFlatEntity> => {
  const maps =
    createEmptyFlatEntityMaps() as UniversalFlatEntityMaps<TUniversalFlatEntity>;

  for (const entity of entities) {
    maps.byUniversalIdentifier[entity.universalIdentifier] = entity;
  }

  return maps;
};

const buildPredicate = (
  overrides: Partial<UniversalFlatRowLevelPermissionPredicate>,
) =>
  ({
    universalIdentifier: 'predicate',
    roleUniversalIdentifier: SALES_ROLE_UNIVERSAL_IDENTIFIER,
    objectMetadataUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
    fieldMetadataUniversalIdentifier: OTHER_FIELD_UNIVERSAL_IDENTIFIER,
    workspaceMemberFieldMetadataUniversalIdentifier: null,
    relationFieldMetadataUniversalIdentifier: null,
    deletedAt: null,
    ...overrides,
  }) as UniversalFlatRowLevelPermissionPredicate;

const validate = ({
  predicates,
  roles = [
    {
      universalIdentifier: SALES_ROLE_UNIVERSAL_IDENTIFIER,
      label: 'Sales',
    } as UniversalFlatRole,
  ],
  objects = [
    {
      universalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
    } as UniversalFlatObjectMetadata,
  ],
  deletedFieldUniversalIdentifiers = [TERRITORY_FIELD_UNIVERSAL_IDENTIFIER],
}: {
  predicates: UniversalFlatRowLevelPermissionPredicate[];
  roles?: UniversalFlatRole[];
  objects?: UniversalFlatObjectMetadata[];
  deletedFieldUniversalIdentifiers?: string[];
}) =>
  validateFieldMetadataNotUsedByRowLevelPermissionPredicateCrossEntity({
    optimisticUniversalFlatMaps: {
      flatRowLevelPermissionPredicateMaps: buildMaps(predicates),
      flatRoleMaps: buildMaps(roles),
      flatObjectMetadataMaps: buildMaps(objects),
    },
    deletedFieldMetadataActions: deletedFieldUniversalIdentifiers.map(
      (universalIdentifier) => ({
        type: 'delete',
        metadataName: 'fieldMetadata',
        universalIdentifier,
      }),
    ),
  }).fieldMetadata;

describe('validateFieldMetadataNotUsedByRowLevelPermissionPredicateCrossEntity', () => {
  it('accepts deleting a field no row-level permission rule uses', () => {
    expect(validate({ predicates: [buildPredicate({})] })).toEqual([]);
  });

  it.each([
    'fieldMetadataUniversalIdentifier',
    'workspaceMemberFieldMetadataUniversalIdentifier',
    'relationFieldMetadataUniversalIdentifier',
  ] as const)(
    'rejects deleting a field a surviving rule references through %s',
    (referenceProperty) => {
      const errors = validate({
        predicates: [
          buildPredicate({
            [referenceProperty]: TERRITORY_FIELD_UNIVERSAL_IDENTIFIER,
          }),
        ],
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].errors).toEqual([
        expect.objectContaining({
          code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
          message: expect.stringContaining('Sales'),
        }),
      ]);
    },
  );

  it('accepts the deletion when the rule is deleted in the same migration', () => {
    expect(validate({ predicates: [] })).toEqual([]);
  });

  it('accepts the deletion when the rule role or object is deleted in the same migration', () => {
    const predicate = buildPredicate({
      fieldMetadataUniversalIdentifier: TERRITORY_FIELD_UNIVERSAL_IDENTIFIER,
    });

    expect(validate({ predicates: [predicate], roles: [] })).toEqual([]);
    expect(validate({ predicates: [predicate], objects: [] })).toEqual([]);
  });
});
