import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { ObjectSystemRelationsOnUpdateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-system-relations-on-update-side-effect-handler.service';

const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';

const buildArgs = ({
  updatedNameSingular,
  updatedNamePlural,
  existingNameSingular = 'rocket',
  existingNamePlural = 'rockets',
  includeExisting = true,
}: {
  updatedNameSingular: string;
  updatedNamePlural: string;
  existingNameSingular?: string;
  existingNamePlural?: string;
  includeExisting?: boolean;
}): BuildSideEffectsArgs<'objectMetadata'> => {
  const existingFlatObjectMetadata = getFlatObjectMetadataMock({
    universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    nameSingular: existingNameSingular,
    namePlural: existingNamePlural,
    labelSingular: existingNameSingular,
    labelPlural: existingNamePlural,
  });

  const updatedFlatObjectMetadata = getFlatObjectMetadataMock({
    universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    nameSingular: updatedNameSingular,
    namePlural: updatedNamePlural,
    labelSingular: updatedNameSingular,
    labelPlural: updatedNamePlural,
  });

  return {
    flatEntity: updatedFlatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName:
      {} as unknown as AllFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps: {
      flatObjectMetadataMaps: {
        byUniversalIdentifier: includeExisting
          ? { [OBJECT_UNIVERSAL_IDENTIFIER]: existingFlatObjectMetadata }
          : {},
      },
      flatFieldMetadataMaps: { byUniversalIdentifier: {} },
      flatIndexMaps: { byUniversalIdentifier: {} },
    },
    context: {},
  } as unknown as BuildSideEffectsArgs<'objectMetadata'>;
};

describe('ObjectSystemRelationsOnUpdateSideEffectHandlerService', () => {
  const handler =
    new (ObjectSystemRelationsOnUpdateSideEffectHandlerService as unknown as new () => ObjectSystemRelationsOnUpdateSideEffectHandlerService)();

  it('should noop when the object name is unchanged', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        existingNameSingular: 'rocket',
        existingNamePlural: 'rockets',
        updatedNameSingular: 'rocket',
        updatedNamePlural: 'rockets',
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should fail when the existing object cannot be resolved from the maps', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        includeExisting: false,
        updatedNameSingular: 'house',
        updatedNamePlural: 'houses',
      }),
    );

    expect(result.status).toBe('fail');
  });

  it('should noop when a renamed object has no system side-effect morph relations to rename', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        updatedNameSingular: 'house',
        updatedNamePlural: 'houses',
      }),
    );

    expect(result.status).toBe('noop');
  });
});
