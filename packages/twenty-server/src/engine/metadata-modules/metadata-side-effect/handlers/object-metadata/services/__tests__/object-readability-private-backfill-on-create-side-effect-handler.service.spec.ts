import {
  MetadataReadability,
  RecordSharePrincipalType,
} from 'twenty-shared/types';

import { ObjectReadabilityPrivateBackfillOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-readability-private-backfill-on-create-side-effect-handler.service';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';

const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const RULE_UNIVERSAL_IDENTIFIER = 'c1c2c3c4-c5c6-4000-8000-000000000001';

const buildArgs = ({
  readability = MetadataReadability.PRIVATE,
  withBackfillSharingRule = false,
  isSystemBuild = false,
}: {
  readability?: MetadataReadability;
  withBackfillSharingRule?: boolean;
  isSystemBuild?: boolean;
}): BuildSideEffectsArgs<'objectMetadata'> => {
  const createdFlatObjectMetadata = {
    universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    nameSingular: 'listing',
    namePlural: 'listings',
    labelPlural: 'Listings',
    readability,
    overrides: null,
  };

  return {
    flatEntity: createdFlatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName: {
      objectMetadata: {
        flatEntityToCreate: {
          [OBJECT_UNIVERSAL_IDENTIFIER]: createdFlatObjectMetadata,
        },
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
      sharingRule: {
        flatEntityToCreate: withBackfillSharingRule
          ? {
              [RULE_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier: RULE_UNIVERSAL_IDENTIFIER,
                objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
                granteePrincipalType: RecordSharePrincipalType.EVERYONE,
                isActive: true,
                deletedAt: null,
                rowLevelPermissionPredicateUniversalIdentifiers: [],
              },
            }
          : {},
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
    },
    relatedFlatEntityMaps: {
      flatObjectMetadataMaps: { byUniversalIdentifier: {} },
      flatSharingRuleMaps: { byUniversalIdentifier: {} },
    },
    context: {
      buildOptions: {
        isSystemBuild,
        applicationUniversalIdentifier: 'application',
      },
    },
  } as unknown as BuildSideEffectsArgs<'objectMetadata'>;
};

describe('ObjectReadabilityPrivateBackfillOnCreateSideEffectHandlerService', () => {
  const handler =
    new (ObjectReadabilityPrivateBackfillOnCreateSideEffectHandlerService as unknown as new () => ObjectReadabilityPrivateBackfillOnCreateSideEffectHandlerService)();

  it('refuses creating a PRIVATE object without a backfill rule in the same migration', () => {
    const result = handler.buildSideEffects(buildArgs({}));

    expect(result.status).toBe('fail');
    if (result.status !== 'fail') {
      throw new Error('expected fail');
    }
    expect(result.type).toBe('create');
    expect(result.errors[0].message).toContain('Listings');
  });

  it('accepts a PRIVATE object created with its backfill rule, a non-PRIVATE object, and system builds', () => {
    expect(
      handler.buildSideEffects(buildArgs({ withBackfillSharingRule: true }))
        .status,
    ).toBe('noop');
    expect(
      handler.buildSideEffects(
        buildArgs({ readability: MetadataReadability.OPEN }),
      ).status,
    ).toBe('noop');
    expect(
      handler.buildSideEffects(buildArgs({ isSystemBuild: true })).status,
    ).toBe('noop');
  });
});
