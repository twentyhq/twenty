import { type FlatFieldMetadataOptionMaps } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option-maps.type';
import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common.type';
import { buildFieldMetadataOptionEnumChangeTracker } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/build-field-metadata-option-enum-change-tracker.util';

const FIELD_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';
const OPEN_OPTION_ID = '20202020-0000-4000-8000-000000000101';
const CLOSED_OPTION_ID = '20202020-0000-4000-8000-000000000102';
const PAUSED_OPTION_ID = '20202020-0000-4000-8000-000000000103';

const buildOptionRow = (
  universalIdentifier: string,
  value: string,
  position: number,
) =>
  ({
    universalIdentifier,
    fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
    value,
    label: value,
    color: null,
    position,
  }) as FlatFieldMetadataOption;

const flatFieldMetadataOptionMaps = {
  byUniversalIdentifier: {
    [OPEN_OPTION_ID]: buildOptionRow(OPEN_OPTION_ID, 'OPEN', 0),
    [CLOSED_OPTION_ID]: buildOptionRow(CLOSED_OPTION_ID, 'CLOSED', 1),
  },
} as unknown as FlatFieldMetadataOptionMaps;

const optionActions = [
  {
    type: 'delete',
    metadataName: 'fieldMetadataOption',
    universalIdentifier: CLOSED_OPTION_ID,
  },
  {
    type: 'update',
    metadataName: 'fieldMetadataOption',
    universalIdentifier: OPEN_OPTION_ID,
    update: { value: 'OPENED' },
  },
  {
    type: 'create',
    metadataName: 'fieldMetadataOption',
    flatEntity: buildOptionRow(PAUSED_OPTION_ID, 'PAUSED', 2),
  },
] as unknown as AllUniversalWorkspaceMigrationAction[];

const toValues = (optionRows: { value: string }[]) =>
  optionRows.map(({ value }) => value);

describe('buildFieldMetadataOptionEnumChangeTracker', () => {
  it('gives the rows of a field before and after the migration, once', () => {
    const tracker = buildFieldMetadataOptionEnumChangeTracker({
      actions: optionActions,
      flatFieldMetadataOptionMaps,
    });

    const enumChange = tracker.consume(FIELD_UNIVERSAL_IDENTIFIER);

    expect(toValues(enumChange?.fromOptionRows ?? [])).toEqual([
      'OPEN',
      'CLOSED',
    ]);
    expect(toValues(enumChange?.toOptionRows ?? [])).toEqual([
      'OPENED',
      'PAUSED',
    ]);
    expect(tracker.consume(FIELD_UNIVERSAL_IDENTIFIER)).toBeUndefined();
  });

  it('gives nothing for a field no option action touches', () => {
    const tracker = buildFieldMetadataOptionEnumChangeTracker({
      actions: [],
      flatFieldMetadataOptionMaps,
    });

    expect(tracker.consume(FIELD_UNIVERSAL_IDENTIFIER)).toBeUndefined();
  });

  it('tells when the field has its own action in the migration', () => {
    const tracker = buildFieldMetadataOptionEnumChangeTracker({
      actions: [
        ...optionActions,
        {
          type: 'update',
          metadataName: 'fieldMetadata',
          universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          update: { defaultValue: "'PAUSED'" },
        },
      ] as unknown as AllUniversalWorkspaceMigrationAction[],
      flatFieldMetadataOptionMaps,
    });

    expect(tracker.hasFieldAction(FIELD_UNIVERSAL_IDENTIFIER)).toBe(true);
    expect(tracker.hasFieldAction(OPEN_OPTION_ID)).toBe(false);
  });
});
