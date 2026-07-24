import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getChartLabelIdentifierColumnNames } from 'src/modules/dashboard/chart-data/utils/get-chart-label-identifier-column-names.util';

const labelFieldMetadataId = 'label-field-id';

const buildFlatFieldMetadataMaps = (
  labelField: Partial<FlatFieldMetadata>,
): FlatEntityMaps<FlatFieldMetadata> =>
  ({
    byUniversalIdentifier: {
      'label-field-universal-id': {
        id: labelFieldMetadataId,
        universalIdentifier: 'label-field-universal-id',
        ...labelField,
      },
    },
    universalIdentifierById: {
      [labelFieldMetadataId]: 'label-field-universal-id',
    },
    universalIdentifiersByApplicationId: {},
  }) as unknown as FlatEntityMaps<FlatFieldMetadata>;

const buildFlatObjectMetadata = (
  labelIdentifierFieldMetadataId: string | null,
): FlatObjectMetadata =>
  ({
    id: 'target-object-id',
    nameSingular: 'agent',
    labelIdentifierFieldMetadataId,
  }) as unknown as FlatObjectMetadata;

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
