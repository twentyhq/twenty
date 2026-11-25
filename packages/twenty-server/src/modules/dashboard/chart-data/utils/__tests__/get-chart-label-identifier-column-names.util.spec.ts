import { FieldMetadataType } from 'twenty-shared/types';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { getChartLabelIdentifierColumnNames } from 'src/modules/dashboard/chart-data/utils/get-chart-label-identifier-column-names.util';

const labelFieldMetadataId = 'label-field-id';

const buildFlatFieldMetadataMaps = (labelField: Partial<FlatFieldMetadata>) =>
  addAllFlatEntitiesToFlatEntityMaps({
    flatEntities: [
      getFlatFieldMetadataMock({
        id: labelFieldMetadataId,
        universalIdentifier: 'label-field-universal-id',
        objectMetadataId: 'target-object-id',
        type: FieldMetadataType.TEXT,
        ...labelField,
      }),
    ],
    flatEntityMaps: createEmptyFlatEntityMaps(),
  });

const buildFlatObjectMetadata = (
  labelIdentifierFieldMetadataId: string | null,
) =>
  getFlatObjectMetadataMock({
    id: 'target-object-id',
    universalIdentifier: 'target-object-universal-id',
    nameSingular: 'agent',
    labelIdentifierFieldMetadataId,
  });

describe('getChartLabelIdentifierColumnNames', () => {
  it('should return id and the column name for a TEXT label identifier', () => {
    expect(
      getChartLabelIdentifierColumnNames({
        flatObjectMetadata: buildFlatObjectMetadata(labelFieldMetadataId),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps({
          name: 'name',
          type: FieldMetadataType.TEXT,
        }),
      }),
    ).toEqual(['id', 'name']);
  });

  it('should return id and the column name for a UUID label identifier', () => {
    expect(
      getChartLabelIdentifierColumnNames({
        flatObjectMetadata: buildFlatObjectMetadata(labelFieldMetadataId),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps({
          name: 'externalId',
          type: FieldMetadataType.UUID,
        }),
      }),
    ).toEqual(['id', 'externalId']);
  });

  it('should return id and the composite column names for a FULL_NAME label identifier', () => {
    expect(
      getChartLabelIdentifierColumnNames({
        flatObjectMetadata: buildFlatObjectMetadata(labelFieldMetadataId),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps({
          name: 'name',
          type: FieldMetadataType.FULL_NAME,
        }),
      }),
    ).toEqual(['id', 'nameFirstName', 'nameLastName']);
  });

  it('should return null when the object has no label identifier field', () => {
    expect(
      getChartLabelIdentifierColumnNames({
        flatObjectMetadata: buildFlatObjectMetadata(null),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps({
          name: 'name',
          type: FieldMetadataType.TEXT,
        }),
      }),
    ).toBeNull();
  });

  it('should return null when the label identifier is the id field itself', () => {
    expect(
      getChartLabelIdentifierColumnNames({
        flatObjectMetadata: buildFlatObjectMetadata(labelFieldMetadataId),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps({
          name: 'id',
          type: FieldMetadataType.UUID,
        }),
      }),
    ).toBeNull();
  });
});
