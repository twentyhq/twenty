import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { deleteFlatEntityForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/delete-flat-entity-foreign-key-aggregators.util';

describe('deleteFlatEntityForeignKeyAggregators', () => {
  it('should strip raw workspace-scoped properties from a flat object metadata', () => {
    const flatObjectMetadata = getFlatObjectMetadataMock({
      universalIdentifier: 'object-universal-identifier',
      applicationId: 'application-id',
      applicationUniversalIdentifier: 'application-universal-identifier',
      labelIdentifierFieldMetadataId: 'label-identifier-field-metadata-id',
      labelIdentifierFieldMetadataUniversalIdentifier:
        'label-identifier-field-metadata-universal-identifier',
      imageIdentifierFieldMetadataId: 'image-identifier-field-metadata-id',
      imageIdentifierFieldMetadataUniversalIdentifier:
        'image-identifier-field-metadata-universal-identifier',
      fieldIds: ['field-id'],
      fieldUniversalIdentifiers: ['field-universal-identifier'],
      viewIds: ['view-id'],
      viewUniversalIdentifiers: ['view-universal-identifier'],
    });

    const result = deleteFlatEntityForeignKeyAggregators({
      universalFlatEntity: flatObjectMetadata,
      metadataName: 'objectMetadata',
    });

    expect(result).toMatchSnapshot();
  });

  it('should strip raw workspace-scoped properties from a flat field metadata', () => {
    const flatFieldMetadata = getFlatFieldMetadataMock({
      universalIdentifier: 'field-universal-identifier',
      type: FieldMetadataType.TEXT,
      applicationUniversalIdentifier: 'application-universal-identifier',
      objectMetadataId: 'object-metadata-id',
      objectMetadataUniversalIdentifier: 'object-metadata-universal-identifier',
      viewFieldIds: ['view-field-id'],
      viewFieldUniversalIdentifiers: ['view-field-universal-identifier'],
    });

    const result = deleteFlatEntityForeignKeyAggregators({
      universalFlatEntity: flatFieldMetadata,
      metadataName: 'fieldMetadata',
    });

    expect(result).toMatchSnapshot();
  });

  it('should not mutate the input entity', () => {
    const flatObjectMetadata = getFlatObjectMetadataMock({
      universalIdentifier: 'object-universal-identifier',
    });

    deleteFlatEntityForeignKeyAggregators({
      universalFlatEntity: flatObjectMetadata,
      metadataName: 'objectMetadata',
    });

    expect(flatObjectMetadata).toHaveProperty('id');
    expect(flatObjectMetadata).toHaveProperty('workspaceId');
    expect(flatObjectMetadata).toHaveProperty('fieldIds');
  });
});
