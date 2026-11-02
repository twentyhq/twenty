/* @license Enterprise */

import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildValidationRuleFieldDescriptors } from 'src/engine/metadata-modules/validation-rule/utils/build-validation-rule-field-descriptors.util';

const OBJECT_METADATA_ID = 'object-metadata-id';

const buildField = (
  field: Pick<FlatFieldMetadata, 'name'> & Partial<FlatFieldMetadata>,
) =>
  getFlatFieldMetadataMock({
    id: `${field.name}-id`,
    universalIdentifier: `${field.name}-universal-identifier`,
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.NUMBER,
    applicationUniversalIdentifier: 'owner-application',
    ...field,
  });

const buildFieldNames = ({
  fields,
  shouldIncludeInactiveFields,
}: {
  fields: FlatFieldMetadata[];
  shouldIncludeInactiveFields?: boolean;
}) => {
  const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> =
    createEmptyFlatEntityMaps();
  const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> =
    createEmptyFlatEntityMaps();

  addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
    flatEntity: getFlatObjectMetadataMock({
      id: OBJECT_METADATA_ID,
      universalIdentifier: 'object-universal-identifier',
      fieldIds: fields.map(({ id }) => id),
    }),
    flatEntityMapsToMutate: flatObjectMetadataMaps,
  });

  for (const field of fields) {
    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity: field,
      flatEntityMapsToMutate: flatFieldMetadataMaps,
    });
  }

  return buildValidationRuleFieldDescriptors({
    objectMetadataId: OBJECT_METADATA_ID,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    shouldIncludeInactiveFields,
  }).map(({ name }) => name);
};

describe('buildValidationRuleFieldDescriptors', () => {
  it('should leave out a field the workspace deactivated through an override', () => {
    expect(
      buildFieldNames({
        fields: [
          buildField({ name: 'score' }),
          buildField({
            name: 'employees',
            overrides: { 'workspace-application': { isActive: false } },
          }),
        ],
      }),
    ).toEqual(['score']);
  });

  it('should keep a field the workspace reactivated through an override', () => {
    expect(
      buildFieldNames({
        fields: [
          buildField({
            name: 'employees',
            isActive: false,
            overrides: { 'workspace-application': { isActive: true } },
          }),
        ],
      }),
    ).toEqual(['employees']);
  });

  it('should leave out a field whose own isActive is false', () => {
    expect(
      buildFieldNames({
        fields: [buildField({ name: 'score', isActive: false })],
      }),
    ).toEqual([]);
  });

  it('should keep inactive fields for record writes, which cannot see overrides', () => {
    expect(
      buildFieldNames({
        fields: [buildField({ name: 'score', isActive: false })],
        shouldIncludeInactiveFields: true,
      }),
    ).toEqual(['score']);
  });
});
