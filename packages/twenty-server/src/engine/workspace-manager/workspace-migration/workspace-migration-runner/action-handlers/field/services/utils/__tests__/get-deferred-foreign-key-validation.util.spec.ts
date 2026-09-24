import {
  FeatureFlagKey,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatCreateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { getDeferredForeignKeyValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/utils/get-deferred-foreign-key-validation.util';

const FEATURE_FLAGS_ON = {
  [FeatureFlagKey.IS_DEFERRED_WORKSPACE_MIGRATION_ACTIONS_ENABLED]: true,
};

const buildField = (
  overrides: Partial<FlatFieldMetadata> = {},
): FlatFieldMetadata =>
  getFlatFieldMetadataMock({
    universalIdentifier: 'company-relation-field',
    objectMetadataId: '20202020-1111-4444-8888-000000000002',
    type: FieldMetadataType.RELATION,
    name: 'company',
    settings: { relationType: RelationType.MANY_TO_ONE },
    ...overrides,
  });

const buildAction = (
  flatEntity: FlatFieldMetadata,
  relatedFlatFieldMetadata?: FlatFieldMetadata,
): FlatCreateFieldAction => ({
  type: 'create',
  metadataName: 'fieldMetadata',
  flatEntity,
  relatedFlatFieldMetadata,
});

describe('getDeferredForeignKeyValidation', () => {
  it('should defer the validation of a many to one join column', () => {
    const flatEntity = buildField();

    expect(
      getDeferredForeignKeyValidation({
        flatAction: buildAction(flatEntity),
        featureFlagsMap: FEATURE_FLAGS_ON,
      }),
    ).toEqual({
      name: 'validateForeignKey',
      payload: { fieldMetadataId: flatEntity.id },
    });
  });

  it('should pick the many to one side when the action creates both sides', () => {
    const oneToManySide = buildField({
      universalIdentifier: 'people-relation-field',
      name: 'people',
      settings: { relationType: RelationType.ONE_TO_MANY },
    });
    const manyToOneSide = buildField();

    expect(
      getDeferredForeignKeyValidation({
        flatAction: buildAction(oneToManySide, manyToOneSide),
        featureFlagsMap: FEATURE_FLAGS_ON,
      })?.payload.fieldMetadataId,
    ).toBe(manyToOneSide.id);
  });

  it('should defer nothing when the flag is off', () => {
    expect(
      getDeferredForeignKeyValidation({
        flatAction: buildAction(buildField()),
        featureFlagsMap: {},
      }),
    ).toBeUndefined();
  });

  it('should defer nothing for a field without a join column', () => {
    expect(
      getDeferredForeignKeyValidation({
        flatAction: buildAction(
          buildField({
            universalIdentifier: 'name-field',
            name: 'name',
            type: FieldMetadataType.TEXT,
            settings: null,
          }),
        ),
        featureFlagsMap: FEATURE_FLAGS_ON,
      }),
    ).toBeUndefined();
  });
});
