import { ADD_UNIVERSAL_IDENTIFIER_AND_APPLICATION_ID_TO_SEARCH_FIELD_METADATA_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-16/add-universal-identifier-and-application-id-to-search-field-metadata-upgrade-command-name.constant';
import { getWasIntroducedInUpgradePropertyMetadata } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { resolveEntityShapeAtUpgradeCursor } from 'src/engine/core-modules/upgrade/utils/resolve-entity-shape-at-upgrade-cursor.util';
import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';

// universalIdentifier, applicationId and position were all added to
// core.searchFieldMetadata in 2.16. Reading them during upgrade-time cache
// computation before that instance command runs (e.g. on a v1.22 schema)
// crashes with "column ... does not exist". These tests lock in the
// upgrade-aware handling so a future newly-added column can't silently
// reintroduce that crash.
const COLUMNS_ADDED_IN_2_16 = [
  'universalIdentifier',
  'applicationId',
  'position',
] as const;

const BASELINE_COLUMNS = [
  'id',
  'objectMetadataId',
  'fieldMetadataId',
  'workspaceId',
  'createdAt',
  'updatedAt',
] as const;

const buildPredicate = (applied: string[]) => {
  const set = new Set(applied);

  return (stepName: string) => set.has(stepName);
};

const currentColumns = [...COLUMNS_ADDED_IN_2_16, ...BASELINE_COLUMNS].map(
  (propertyName) => ({ propertyName, databaseName: propertyName }),
);

describe('SearchFieldMetadataEntity upgrade-aware shape', () => {
  it('marks the three 2.16 columns as introduced in the 2.16 instance command', () => {
    const introduced = getWasIntroducedInUpgradePropertyMetadata(
      SearchFieldMetadataEntity,
    );

    for (const propertyName of COLUMNS_ADDED_IN_2_16) {
      expect(introduced[propertyName]).toEqual({
        upgradeCommandName:
          ADD_UNIVERSAL_IDENTIFIER_AND_APPLICATION_ID_TO_SEARCH_FIELD_METADATA_UPGRADE_COMMAND_NAME,
      });
    }
  });

  it('hides the 2.16 columns before the instance command has run', () => {
    const result = resolveEntityShapeAtUpgradeCursor({
      entityClass: SearchFieldMetadataEntity,
      currentTableName: 'searchFieldMetadata',
      currentColumns,
      isStepApplied: buildPredicate([]),
    });

    expect(result.isAvailable).toBe(true);
    expect(result.hiddenPropertyNames).toEqual(
      new Set(COLUMNS_ADDED_IN_2_16),
    );
  });

  it('exposes all columns once the 2.16 instance command has run', () => {
    const result = resolveEntityShapeAtUpgradeCursor({
      entityClass: SearchFieldMetadataEntity,
      currentTableName: 'searchFieldMetadata',
      currentColumns,
      isStepApplied: buildPredicate([
        ADD_UNIVERSAL_IDENTIFIER_AND_APPLICATION_ID_TO_SEARCH_FIELD_METADATA_UPGRADE_COMMAND_NAME,
      ]),
    });

    expect(result.hiddenPropertyNames.size).toBe(0);
  });

  it('never hides baseline columns that pre-date 2.16', () => {
    for (const applied of [
      [],
      [ADD_UNIVERSAL_IDENTIFIER_AND_APPLICATION_ID_TO_SEARCH_FIELD_METADATA_UPGRADE_COMMAND_NAME],
    ] as string[][]) {
      const result = resolveEntityShapeAtUpgradeCursor({
        entityClass: SearchFieldMetadataEntity,
        currentTableName: 'searchFieldMetadata',
        currentColumns,
        isStepApplied: buildPredicate(applied),
      });

      for (const baselineColumn of BASELINE_COLUMNS) {
        expect(result.hiddenPropertyNames.has(baselineColumn)).toBe(false);
      }
    }
  });
});
