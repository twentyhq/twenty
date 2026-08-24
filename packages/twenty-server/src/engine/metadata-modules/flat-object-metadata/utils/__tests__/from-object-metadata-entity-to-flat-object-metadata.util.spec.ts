import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { fromObjectMetadataEntityToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-entity-to-flat-object-metadata.util';

const APPLICATION_ID = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000002';

const buildObjectMetadataEntity = (
  pageLayouts: { id: string; universalIdentifier: string }[],
): ObjectMetadataEntity =>
  ({
    id: 'b1b2b3b4-b5b6-4000-8000-000000000001',
    universalIdentifier: 'b1b2b3b4-b5b6-4000-8000-000000000002',
    applicationId: APPLICATION_ID,
    labelIdentifierFieldMetadataId: null,
    imageIdentifierFieldMetadataId: null,
    fields: [],
    indexMetadatas: [],
    searchFieldMetadatas: [],
    views: [],
    objectPermissions: [],
    fieldPermissions: [],
    pageLayouts,
  }) as unknown as ObjectMetadataEntity;

describe('fromObjectMetadataEntityToFlatObjectMetadata', () => {
  it('should populate the page layout foreign key aggregators', () => {
    const pageLayouts = [
      {
        id: 'c1c2c3c4-c5c6-4000-8000-000000000001',
        universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000002',
      },
      {
        id: 'c1c2c3c4-c5c6-4000-8000-000000000003',
        universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000004',
      },
    ];

    const flatObjectMetadata = fromObjectMetadataEntityToFlatObjectMetadata({
      entity: buildObjectMetadataEntity(pageLayouts),
      applicationIdToUniversalIdentifierMap: new Map([
        [APPLICATION_ID, APPLICATION_UNIVERSAL_IDENTIFIER],
      ]),
      fieldMetadataIdToUniversalIdentifierMap: new Map(),
    });

    expect(flatObjectMetadata.pageLayoutIds).toEqual(
      pageLayouts.map(({ id }) => id),
    );
    expect(flatObjectMetadata.pageLayoutUniversalIdentifiers).toEqual(
      pageLayouts.map(({ universalIdentifier }) => universalIdentifier),
    );
  });

  it('should return empty page layout aggregators when the object has no page layout', () => {
    const flatObjectMetadata = fromObjectMetadataEntityToFlatObjectMetadata({
      entity: buildObjectMetadataEntity([]),
      applicationIdToUniversalIdentifierMap: new Map([
        [APPLICATION_ID, APPLICATION_UNIVERSAL_IDENTIFIER],
      ]),
      fieldMetadataIdToUniversalIdentifierMap: new Map(),
    });

    expect(flatObjectMetadata.pageLayoutIds).toEqual([]);
    expect(flatObjectMetadata.pageLayoutUniversalIdentifiers).toEqual([]);
  });
});
