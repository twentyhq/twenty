import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { handleIndexChangesDuringFieldUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/handle-index-changes-during-field-update.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const buildFlatEntityMaps = (
  entities: Array<{ id: string; universalIdentifier: string }>,
) =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      entities.map((entity) => [entity.universalIdentifier, entity]),
    ),
    universalIdentifierById: Object.fromEntries(
      entities.map((entity) => [entity.id, entity.universalIdentifier]),
    ),
    universalIdentifiersByApplicationId: {},
  }) as FlatEntityMaps<never>;

describe('handleIndexChangesDuringFieldUpdate', () => {
  const flatApplication = {
    id: 'app-id',
  } as FlatApplication;

  const fromFlatFieldMetadata = {
    id: 'field-id',
    objectMetadataId: 'object-id',
    universalIdentifier: 'field-universal-id',
    applicationUniversalIdentifier: 'app-universal-id',
    name: 'email',
    isUnique: true,
    type: 'TEXT',
  } as FlatFieldMetadata;

  const toFlatFieldMetadata = {
    ...fromFlatFieldMetadata,
    isUnique: false,
  };

  const flatObjectMetadata = {
    id: 'object-id',
    universalIdentifier: 'object-universal-id',
    name: 'company',
    indexMetadataIds: ['index-id'],
  } as FlatObjectMetadata;

  it('should delete unique index when name does not match but index is linked to the field', () => {
    const uniqueIndexWithLegacyName = {
      id: 'index-id',
      universalIdentifier: 'index-universal-id',
      name: 'legacy_v1_unique_index_name',
      isUnique: true,
      isCustom: true,
      applicationId: flatApplication.id,
      flatIndexFieldMetadatas: [
        {
          fieldMetadataId: fromFlatFieldMetadata.id,
        },
      ],
    } as FlatIndexMetadata;

    const result = handleIndexChangesDuringFieldUpdate({
      fromFlatFieldMetadata,
      toFlatFieldMetadata,
      flatApplication,
      flatFieldMetadataMaps: buildFlatEntityMaps([fromFlatFieldMetadata]),
      flatObjectMetadataMaps: buildFlatEntityMaps([flatObjectMetadata]),
      flatIndexMaps: buildFlatEntityMaps([uniqueIndexWithLegacyName]),
    });

    expect(result.status).toBe('success');

    if (result.status === 'fail') {
      return;
    }

    expect(result.result.flatIndexMetadatasToDelete).toEqual([
      uniqueIndexWithLegacyName,
    ]);
  });

  it('should not delete composite unique indexes when toggling field uniqueness off', () => {
    const compositeUniqueIndex = {
      id: 'index-id',
      universalIdentifier: 'index-universal-id',
      name: 'legacy_v1_unique_index_name',
      isUnique: true,
      isCustom: true,
      applicationId: flatApplication.id,
      flatIndexFieldMetadatas: [
        {
          fieldMetadataId: fromFlatFieldMetadata.id,
        },
        {
          fieldMetadataId: 'other-field-id',
        },
      ],
    } as FlatIndexMetadata;

    const result = handleIndexChangesDuringFieldUpdate({
      fromFlatFieldMetadata,
      toFlatFieldMetadata,
      flatApplication,
      flatFieldMetadataMaps: buildFlatEntityMaps([fromFlatFieldMetadata]),
      flatObjectMetadataMaps: buildFlatEntityMaps([
        {
          ...flatObjectMetadata,
          indexMetadataIds: [compositeUniqueIndex.id],
        },
      ]),
      flatIndexMaps: buildFlatEntityMaps([compositeUniqueIndex]),
    });

    expect(result.status).toBe('success');

    if (result.status === 'fail') {
      return;
    }

    expect(result.result.flatIndexMetadatasToDelete).toEqual([]);
  });
});
