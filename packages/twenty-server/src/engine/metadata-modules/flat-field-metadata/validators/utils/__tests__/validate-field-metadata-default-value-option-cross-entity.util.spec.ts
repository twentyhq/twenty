import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { validateFieldMetadataDefaultValueOptionCrossEntity } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-field-metadata-default-value-option-cross-entity.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const FIELD_UNIVERSAL_IDENTIFIER = 'status-field';
const OPEN_OPTION_UNIVERSAL_IDENTIFIER = 'open-option';
const PAUSED_OPTION_UNIVERSAL_IDENTIFIER = 'paused-option';

const buildOptionMaps = ({ isPausedActive }: { isPausedActive: boolean }) => ({
  ...createEmptyFlatEntityMaps(),
  byUniversalIdentifier: {
    [OPEN_OPTION_UNIVERSAL_IDENTIFIER]: {
      universalIdentifier: OPEN_OPTION_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      value: 'OPEN',
      isActive: true,
      overrides: null,
    },
    [PAUSED_OPTION_UNIVERSAL_IDENTIFIER]: {
      universalIdentifier: PAUSED_OPTION_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      value: 'PAUSED',
      isActive: isPausedActive,
      overrides: null,
    },
  },
});

const validate = ({
  update,
  isPausedActiveBefore,
}: {
  update: Partial<UniversalFlatFieldMetadata>;
  isPausedActiveBefore: boolean;
}) =>
  validateFieldMetadataDefaultValueOptionCrossEntity({
    isWorkspaceCaller: true,
    fromFlatFieldMetadataOptionMaps: buildOptionMaps({
      isPausedActive: isPausedActiveBefore,
    }) as never,
    optimisticUniversalFlatMaps: {
      flatFieldMetadataMaps: {
        ...createEmptyFlatEntityMaps(),
        byUniversalIdentifier: {
          [FIELD_UNIVERSAL_IDENTIFIER]: {
            universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
            name: 'status',
            objectMetadataUniversalIdentifier: 'ticket-object',
            type: FieldMetadataType.SELECT,
            defaultValue: "'PAUSED'",
            options: null,
          },
        },
      } as never,
      flatFieldMetadataOptionMaps: buildOptionMaps({
        isPausedActive: false,
      }) as never,
    },
    orchestratorActionsReport: {
      fieldMetadata: {
        create: [],
        update: [{ universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER, update }],
        delete: [],
      },
      fieldMetadataOption: { create: [], update: [], delete: [] },
    } as never,
  }).fieldMetadata;

describe('validateFieldMetadataDefaultValueOptionCrossEntity', () => {
  it('lets an unrelated edit pass when the default option was already inactive', () => {
    expect(
      validate({ update: { label: 'State' }, isPausedActiveBefore: false }),
    ).toEqual([]);
  });

  it('rejects setting the default to an inactive option', () => {
    expect(
      validate({
        update: { defaultValue: "'PAUSED'" },
        isPausedActiveBefore: false,
      }),
    ).toHaveLength(1);
  });

  it('rejects deactivating the default option', () => {
    expect(
      validate({ update: { label: 'State' }, isPausedActiveBefore: true }),
    ).toHaveLength(1);
  });
  it('rejects replacing the active default option with an inactive one of the same value', () => {
    const recreatedPausedOption = {
      universalIdentifier: 'recreated-paused-option',
      fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      value: 'PAUSED',
      isActive: false,
      overrides: null,
    };
    const {
      [PAUSED_OPTION_UNIVERSAL_IDENTIFIER]: _deletedPausedOption,
      ...remainingOptions
    } = buildOptionMaps({ isPausedActive: true }).byUniversalIdentifier;

    expect(
      validateFieldMetadataDefaultValueOptionCrossEntity({
        isWorkspaceCaller: true,
        fromFlatFieldMetadataOptionMaps: {
          ...createEmptyFlatEntityMaps(),
          byUniversalIdentifier: {
            [PAUSED_OPTION_UNIVERSAL_IDENTIFIER]: buildOptionMaps({
              isPausedActive: true,
            }).byUniversalIdentifier[PAUSED_OPTION_UNIVERSAL_IDENTIFIER],
          },
        } as never,
        optimisticUniversalFlatMaps: {
          flatFieldMetadataMaps: {
            ...createEmptyFlatEntityMaps(),
            byUniversalIdentifier: {
              [FIELD_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
                name: 'status',
                objectMetadataUniversalIdentifier: 'ticket-object',
                type: FieldMetadataType.SELECT,
                defaultValue: "'PAUSED'",
                options: null,
              },
            },
          } as never,
          flatFieldMetadataOptionMaps: {
            ...createEmptyFlatEntityMaps(),
            byUniversalIdentifier: {
              ...remainingOptions,
              [recreatedPausedOption.universalIdentifier]:
                recreatedPausedOption,
            },
          } as never,
        },
        orchestratorActionsReport: {
          fieldMetadata: { create: [], update: [], delete: [] },
          fieldMetadataOption: {
            create: [{ flatEntity: recreatedPausedOption }],
            update: [],
            delete: [
              { universalIdentifier: PAUSED_OPTION_UNIVERSAL_IDENTIFIER },
            ],
          },
        } as never,
      }).fieldMetadata,
    ).toHaveLength(1);
  });
});
