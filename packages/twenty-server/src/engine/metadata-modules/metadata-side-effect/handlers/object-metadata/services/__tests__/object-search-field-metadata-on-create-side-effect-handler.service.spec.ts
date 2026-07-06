import { getFieldUniversalIdentifier } from 'twenty-shared/application';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { ObjectSearchFieldMetadataOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-search-field-metadata-on-create-side-effect-handler.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';

const NAME_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'name',
});

const ID_FIELD_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'id',
});

const buildArgs = ({
  isSearchable,
  labelIdentifierFieldMetadataUniversalIdentifier,
  relatedFlatEntityMaps = {
    flatFieldMetadataMaps: { byUniversalIdentifier: {} },
    flatSearchFieldMetadataMaps: { byUniversalIdentifier: {} },
  },
}: {
  isSearchable: boolean;
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
  relatedFlatEntityMaps?: object;
}): BuildSideEffectsArgs<'objectMetadata'> =>
  ({
    flatEntity: {
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      isSearchable,
      labelIdentifierFieldMetadataUniversalIdentifier,
    },
    allFlatEntityOperationRecordByMetadataName:
      {} as unknown as AllFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
    context: {},
  }) as unknown as BuildSideEffectsArgs<'objectMetadata'>;

describe('ObjectSearchFieldMetadataOnCreateSideEffectHandlerService', () => {
  const handler =
    new (ObjectSearchFieldMetadataOnCreateSideEffectHandlerService as unknown as new () => ObjectSearchFieldMetadataOnCreateSideEffectHandlerService)();

  it('should synthesize a searchFieldMetadata targeting the name label identifier of a searchable object', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        isSearchable: true,
        labelIdentifierFieldMetadataUniversalIdentifier:
          NAME_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    expect(
      Object.keys(
        result.operations.searchFieldMetadata?.flatEntityToCreate ?? {},
      ),
    ).toHaveLength(1);
  });

  it('should noop when the object is not searchable', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        isSearchable: false,
        labelIdentifierFieldMetadataUniversalIdentifier:
          NAME_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should noop for junction objects whose label identifier is the id field', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        isSearchable: true,
        labelIdentifierFieldMetadataUniversalIdentifier:
          ID_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    );

    expect(result.status).toBe('noop');
  });
});
