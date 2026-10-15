/* @license Enterprise */

import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { buildValidationRuleUpdatesAfterFieldChangesSideEffect } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/build-validation-rule-updates-after-field-changes-side-effect.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const WORKSPACE_APPLICATION_UNIVERSAL_IDENTIFIER = 'workspace-application';
const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER = 'other-application';

const FIELDS = [
  {
    universalIdentifier: 'stage',
    name: 'stage',
    type: FieldMetadataType.SELECT,
  },
  {
    universalIdentifier: 'score',
    name: 'score',
    type: FieldMetadataType.NUMBER,
  },
];

const buildRelatedFlatEntityMaps = () => {
  const maps = createEmptyAllFlatEntityMaps();

  for (const field of FIELDS) {
    maps.flatFieldMetadataMaps.byUniversalIdentifier[
      field.universalIdentifier
    ] = { ...field, isActive: true } as FlatFieldMetadata;
  }

  maps.flatValidationRuleMaps.byUniversalIdentifier['stage-rule'] = {
    universalIdentifier: 'stage-rule',
    objectMetadataUniversalIdentifier: 'opportunity',
    applicationUniversalIdentifier: WORKSPACE_APPLICATION_UNIVERSAL_IDENTIFIER,
    name: 'Lost needs a reason',
    expression: 'stage != "LOST"',
    bindings: { stage: 'stage' },
    isActive: true,
    errorFieldMetadataUniversalIdentifier: null,
  } as FlatValidationRule;

  return maps;
};

const renameFields = (
  newNameByUniversalIdentifier: Record<string, string>,
): AllFlatEntityOperationRecordByMetadataName => ({
  fieldMetadata: {
    flatEntityToCreate: {},
    flatEntityToUpdate: Object.fromEntries(
      FIELDS.filter(
        (field) => field.universalIdentifier in newNameByUniversalIdentifier,
      ).map((field) => [
        field.universalIdentifier,
        {
          ...field,
          name: newNameByUniversalIdentifier[field.universalIdentifier],
          isActive: true,
        } as UniversalFlatFieldMetadata,
      ]),
    ),
    flatEntityToDelete: {},
  },
});

describe('buildValidationRuleUpdatesAfterFieldChangesSideEffect', () => {
  it('should fail when another field change of the same migration comes with a reserved rename read by an owned active rule', () => {
    const result = buildValidationRuleUpdatesAfterFieldChangesSideEffect({
      allFlatEntityOperationRecordByMetadataName: renameFields({
        score: 'points',
        stage: 'now',
      }),
      relatedFlatEntityMaps: buildRelatedFlatEntityMaps(),
      applicationUniversalIdentifier:
        WORKSPACE_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(result).toMatchObject({
      status: 'fail',
      flatEntityMinimalInformation: {
        universalIdentifier: 'stage',
        name: 'now',
      },
    });
  });

  it('should disable the rule instead when it is owned by another application', () => {
    const result = buildValidationRuleUpdatesAfterFieldChangesSideEffect({
      allFlatEntityOperationRecordByMetadataName: renameFields({
        stage: 'now',
      }),
      relatedFlatEntityMaps: buildRelatedFlatEntityMaps(),
      applicationUniversalIdentifier: OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(result).toMatchObject({
      status: 'success',
      operations: {
        validationRule: {
          flatEntityToUpdate: { 'stage-rule': { isActive: false } },
        },
      },
    });
  });
});
