import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { ObjectTsVectorGinIndexOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-ts-vector-gin-index-on-create-side-effect-handler.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';

const buildArgs = ({
  allFlatEntityOperationRecordByMetadataName = {} as unknown as AllFlatEntityOperationRecordByMetadataName,
  relatedFlatEntityMaps = {},
}: {
  allFlatEntityOperationRecordByMetadataName?: AllFlatEntityOperationRecordByMetadataName;
  relatedFlatEntityMaps?: object;
} = {}): BuildSideEffectsArgs<'objectMetadata'> =>
  ({
    flatEntity: {
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      nameSingular: 'ticket',
    },
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
    context: {},
  }) as unknown as BuildSideEffectsArgs<'objectMetadata'>;

describe('ObjectTsVectorGinIndexOnCreateSideEffectHandlerService', () => {
  const handler =
    new (ObjectTsVectorGinIndexOnCreateSideEffectHandlerService as unknown as new () => ObjectTsVectorGinIndexOnCreateSideEffectHandlerService)();

  it('should synthesize a single GIN index with a deterministic universal identifier', () => {
    const result = handler.buildSideEffects(buildArgs());

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    const createdUniversalIdentifiers = Object.keys(
      result.operations.index?.flatEntityToCreate ?? {},
    );

    expect(createdUniversalIdentifiers).toHaveLength(1);
  });

  it('should be deterministic across invocations', () => {
    const firstResult = handler.buildSideEffects(buildArgs());
    const secondResult = handler.buildSideEffects(buildArgs());

    if (firstResult.status !== 'success' || secondResult.status !== 'success') {
      throw new Error('expected success');
    }

    expect(
      Object.keys(firstResult.operations.index?.flatEntityToCreate ?? {}),
    ).toEqual(
      Object.keys(secondResult.operations.index?.flatEntityToCreate ?? {}),
    );
  });

  it('should noop when the GIN index already exists in the from-state', () => {
    const firstResult = handler.buildSideEffects(buildArgs());

    if (firstResult.status !== 'success') {
      throw new Error('expected success');
    }

    const [ginIndexUniversalIdentifier] = Object.keys(
      firstResult.operations.index?.flatEntityToCreate ?? {},
    );

    const result = handler.buildSideEffects(
      buildArgs({
        relatedFlatEntityMaps: {
          flatIndexMaps: {
            byUniversalIdentifier: {
              [ginIndexUniversalIdentifier]: {
                universalIdentifier: ginIndexUniversalIdentifier,
              },
            },
          },
        },
      }),
    );

    expect(result.status).toBe('noop');
  });
});
