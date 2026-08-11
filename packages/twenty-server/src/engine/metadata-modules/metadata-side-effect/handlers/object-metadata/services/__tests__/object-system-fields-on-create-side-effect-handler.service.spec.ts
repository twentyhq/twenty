import { getFieldUniversalIdentifier } from 'twenty-shared/application';

import { ObjectSystemFieldsOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-system-fields-on-create-side-effect-handler.service';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';

const computeFieldUniversalIdentifier = (name: string) =>
  getFieldUniversalIdentifier({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    name,
  });

const ALL_SYSTEM_FIELD_NAMES = [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'position',
] as const;

const buildArgs = (): BuildSideEffectsArgs<'objectMetadata'> =>
  ({
    flatEntity: {
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      nameSingular: 'ticket',
      labelIdentifierFieldMetadataUniversalIdentifier:
        computeFieldUniversalIdentifier('name'),
    },
    allFlatEntityOperationRecordByMetadataName: {},
    relatedFlatEntityMaps: {},
    context: {},
  }) as unknown as BuildSideEffectsArgs<'objectMetadata'>;

describe('ObjectSystemFieldsOnCreateSideEffectHandlerService', () => {
  const handler =
    new (ObjectSystemFieldsOnCreateSideEffectHandlerService as unknown as new () => ObjectSystemFieldsOnCreateSideEffectHandlerService)();

  it('should synthesize exactly the 7 reserved system fields, never the caller name nor searchVector', () => {
    const result = handler.buildSideEffects(buildArgs());

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    const createdUniversalIdentifiers = Object.keys(
      result.operations.fieldMetadata?.flatEntityToCreate ?? {},
    );

    expect(createdUniversalIdentifiers).toHaveLength(7);
    expect(createdUniversalIdentifiers).not.toContain(
      computeFieldUniversalIdentifier('name'),
    );
    expect(createdUniversalIdentifiers).not.toContain(
      computeFieldUniversalIdentifier('searchVector'),
    );

    for (const name of ALL_SYSTEM_FIELD_NAMES) {
      expect(createdUniversalIdentifiers).toContain(
        computeFieldUniversalIdentifier(name),
      );
    }

    for (const createdFlatFieldMetadata of Object.values(
      result.operations.fieldMetadata?.flatEntityToCreate ?? {},
    )) {
      expect(createdFlatFieldMetadata.isSystemSideEffect).toBe(true);
    }
  });

  it('should emit nothing but field metadata', () => {
    const result = handler.buildSideEffects(buildArgs());

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    expect(Object.keys(result.operations)).toEqual(['fieldMetadata']);
  });
});
