import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common.type';
import { computeFieldMetadataOptionEnumChanges } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/compute-field-metadata-option-enum-changes.util';

const FIELD_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';
const OPEN_OPTION_ID = '20202020-0000-4000-8000-000000000101';
const CLOSED_OPTION_ID = '20202020-0000-4000-8000-000000000102';
const PAUSED_OPTION_ID = '20202020-0000-4000-8000-000000000103';
const OTHER_FIELD_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000002';
const OTHER_FIELD_OPTION_ID = '20202020-0000-4000-8000-000000000201';

const buildOptionRow = ({
  universalIdentifier,
  value,
  position,
  fieldMetadataUniversalIdentifier = FIELD_UNIVERSAL_IDENTIFIER,
}: {
  universalIdentifier: string;
  value: string;
  position: number;
  fieldMetadataUniversalIdentifier?: string;
}) => ({
  universalIdentifier,
  fieldMetadataUniversalIdentifier,
  value,
  label: value,
  color: null,
  position,
});

const flatFieldMetadataOptionMaps = {
  byUniversalIdentifier: {
    [OPEN_OPTION_ID]: buildOptionRow({
      universalIdentifier: OPEN_OPTION_ID,
      value: 'OPEN',
      position: 0,
    }),
    [CLOSED_OPTION_ID]: buildOptionRow({
      universalIdentifier: CLOSED_OPTION_ID,
      value: 'CLOSED',
      position: 1,
    }),
  },
};

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
    flatEntity: buildOptionRow({
      universalIdentifier: PAUSED_OPTION_ID,
      value: 'PAUSED',
      position: 2,
    }),
  },
] as unknown as AllUniversalWorkspaceMigrationAction[];

const toValues = (optionRows: { value: string }[]) =>
  optionRows.map(({ value }) => value);

describe('computeFieldMetadataOptionEnumChanges', () => {
  it('gives the rows of a field before and after the migration', () => {
    const enumChange = computeFieldMetadataOptionEnumChanges({
      actions: optionActions,
      flatFieldMetadataOptionMaps,
    }).get(FIELD_UNIVERSAL_IDENTIFIER);

    expect(toValues(enumChange?.fromOptionRows ?? [])).toEqual([
      'OPEN',
      'CLOSED',
    ]);
    expect(toValues(enumChange?.toOptionRows ?? [])).toEqual([
      'OPENED',
      'PAUSED',
    ]);
    expect(enumChange?.hasFieldAction).toBe(false);
  });

  it('gives nothing for a field no option action touches', () => {
    expect(
      computeFieldMetadataOptionEnumChanges({
        actions: [],
        flatFieldMetadataOptionMaps,
      }).get(FIELD_UNIVERSAL_IDENTIFIER),
    ).toBeUndefined();
  });

  it('tells when the field has its own action in the migration', () => {
    const enumChanges = computeFieldMetadataOptionEnumChanges({
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

    expect(enumChanges.get(FIELD_UNIVERSAL_IDENTIFIER)?.hasFieldAction).toBe(
      true,
    );
    expect(enumChanges.has(OPEN_OPTION_ID)).toBe(false);
  });

  it('keeps the rows of other fields out of a field change', () => {
    const enumChanges = computeFieldMetadataOptionEnumChanges({
      actions: optionActions,
      flatFieldMetadataOptionMaps: {
        byUniversalIdentifier: {
          ...flatFieldMetadataOptionMaps.byUniversalIdentifier,
          [OTHER_FIELD_OPTION_ID]: buildOptionRow({
            universalIdentifier: OTHER_FIELD_OPTION_ID,
            value: 'OTHER',
            position: 0,
            fieldMetadataUniversalIdentifier: OTHER_FIELD_UNIVERSAL_IDENTIFIER,
          }),
        },
      },
    });
    const enumChange = enumChanges.get(FIELD_UNIVERSAL_IDENTIFIER);

    expect(toValues(enumChange?.fromOptionRows ?? [])).toEqual([
      'OPEN',
      'CLOSED',
    ]);
    expect(toValues(enumChange?.toOptionRows ?? [])).toEqual([
      'OPENED',
      'PAUSED',
    ]);
    expect(enumChanges.has(OTHER_FIELD_UNIVERSAL_IDENTIFIER)).toBe(false);
  });
});
