import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getStandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';
import { createStandardObjectFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/object-metadata/create-standard-object-flat-metadata.util';

describe('createStandardObjectFlatMetadata', () => {
  it('resolves object and identifier fields through the definition key when the technical name differs', () => {
    const standardObjectMetadataRelatedEntityIds =
      getStandardObjectMetadataRelatedEntityIds();
    const objectMetadata = createStandardObjectFlatMetadata({
      objectName: 'person',
      context: {
        universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
        nameSingular: 'contact',
        namePlural: 'contacts',
        labelSingular: 'Contact',
        labelPlural: 'Contacts',
        description: 'Contact metadata',
        icon: 'IconUser',
        labelIdentifierFieldMetadataName: 'name',
        imageIdentifierFieldMetadataName: 'avatarFile',
      },
      workspaceId: '20202020-1111-4111-8111-111111111111',
      twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
      now: '2026-11-05T00:00:00.000Z',
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps: {
        flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
      },
    });

    expect(objectMetadata).toMatchObject({
      id: standardObjectMetadataRelatedEntityIds.person.id,
      universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
      nameSingular: 'contact',
      namePlural: 'contacts',
      labelIdentifierFieldMetadataId:
        standardObjectMetadataRelatedEntityIds.person.fields.name.id,
      labelIdentifierFieldMetadataUniversalIdentifier:
        STANDARD_OBJECTS.person.fields.name.universalIdentifier,
      imageIdentifierFieldMetadataId:
        standardObjectMetadataRelatedEntityIds.person.fields.avatarFile.id,
      imageIdentifierFieldMetadataUniversalIdentifier:
        STANDARD_OBJECTS.person.fields.avatarFile.universalIdentifier,
    });
  });
});
