import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { validateFieldMetadataNotUsedByRowLevelPermissionPredicateCrossEntity } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-field-metadata-not-used-by-row-level-permission-predicate-cross-entity.util';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';

const COMPANY_OBJECT_UNIVERSAL_IDENTIFIER = 'company-object';
const TERRITORY_FIELD_UNIVERSAL_IDENTIFIER = 'territory-field';
const SALES_ROLE_UNIVERSAL_IDENTIFIER = 'sales-role';
const PREDICATE_UNIVERSAL_IDENTIFIER = 'territory-predicate';

const buildMaps = (entities: { universalIdentifier: string }[]) => ({
  ...createEmptyFlatEntityMaps(),
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
});

const buildPredicate = (
  overrides: Partial<FlatRowLevelPermissionPredicate> = {},
) => ({
  universalIdentifier: PREDICATE_UNIVERSAL_IDENTIFIER,
  roleUniversalIdentifier: SALES_ROLE_UNIVERSAL_IDENTIFIER,
  objectMetadataUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: 'other-field',
  workspaceMemberFieldMetadataUniversalIdentifier: null,
  relationFieldMetadataUniversalIdentifier: null,
  deletedAt: null,
  ...overrides,
});

const territoryPredicate = buildPredicate({
  fieldMetadataUniversalIdentifier: TERRITORY_FIELD_UNIVERSAL_IDENTIFIER,
});

const buildDeleteActions = (universalIdentifiers: string[]) =>
  universalIdentifiers.map((universalIdentifier) => ({ universalIdentifier }));

const validate = ({
  workspacePredicates = [],
  migrationPredicates = [],
  deletedPredicateUniversalIdentifiers = [],
  deletedRoleUniversalIdentifiers = [],
  deletedObjectUniversalIdentifiers = [],
}: {
  workspacePredicates?: ReturnType<typeof buildPredicate>[];
  migrationPredicates?: ReturnType<typeof buildPredicate>[];
  deletedPredicateUniversalIdentifiers?: string[];
  deletedRoleUniversalIdentifiers?: string[];
  deletedObjectUniversalIdentifiers?: string[];
}) =>
  validateFieldMetadataNotUsedByRowLevelPermissionPredicateCrossEntity({
    workspaceRowLevelPermissionFlatEntityMaps: {
      flatRowLevelPermissionPredicateMaps: buildMaps(
        workspacePredicates,
      ) as never,
      flatRoleMaps: buildMaps([
        {
          universalIdentifier: SALES_ROLE_UNIVERSAL_IDENTIFIER,
          label: 'Sales',
        },
      ] as never) as never,
    },
    optimisticUniversalFlatMaps: {
      flatRowLevelPermissionPredicateMaps: buildMaps(
        migrationPredicates,
      ) as never,
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
  it('accepts deleting a field no row-level permission rule uses', () => {
    expect(validate({ workspacePredicates: [buildPredicate()] })).toEqual([]);
  });

  it.each([
    'fieldMetadataUniversalIdentifier',
    'workspaceMemberFieldMetadataUniversalIdentifier',
    'relationFieldMetadataUniversalIdentifier',
  ] as const)(
    'rejects deleting a field a workspace rule outside the migration references through %s',
    (referenceProperty) => {
      const errors = validate({
        workspacePredicates: [
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

  it('rejects deleting a field a rule created in the same migration references', () => {
    expect(
      validate({ migrationPredicates: [territoryPredicate] }),
    ).toHaveLength(1);
  });

  it('accepts the deletion when the rule, its role or its object is deleted in the same migration', () => {
    const workspacePredicates = [territoryPredicate];

    expect(
      validate({
        workspacePredicates,
        deletedPredicateUniversalIdentifiers: [PREDICATE_UNIVERSAL_IDENTIFIER],
      }),
    ).toEqual([]);
    expect(
      validate({
        workspacePredicates,
        deletedRoleUniversalIdentifiers: [SALES_ROLE_UNIVERSAL_IDENTIFIER],
      }),
    ).toEqual([]);
    expect(
      validate({
        workspacePredicates,
        deletedObjectUniversalIdentifiers: [
          COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
        ],
      }),
    ).toEqual([]);
  });
});
