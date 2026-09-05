import {
  MetadataReadability,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { ObjectReadabilityPrivateBackfillOnUpdateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-readability-private-backfill-on-update-side-effect-handler.service';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type ObjectMetadataOverrides } from 'src/engine/metadata-modules/object-metadata/types/object-metadata-overrides.type';

const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const OTHER_OBJECT_UNIVERSAL_IDENTIFIER =
  'b1b2b3b4-b5b6-4000-8000-000000000002';
const EXISTING_RULE_UNIVERSAL_IDENTIFIER =
  'c1c2c3c4-c5c6-4000-8000-000000000001';
const CREATED_RULE_UNIVERSAL_IDENTIFIER =
  'c1c2c3c4-c5c6-4000-8000-000000000002';
const PREDICATE_UNIVERSAL_IDENTIFIER = 'd1d2d3d4-d5d6-4000-8000-000000000001';

const buildFlatObjectMetadata = (
  overrides: Partial<{
    readability: MetadataReadability;
    overrides: ObjectMetadataOverrides | null;
  }> = {},
) => ({
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'listing',
  namePlural: 'listings',
  labelPlural: 'Listings',
  readability: MetadataReadability.OPEN,
  overrides: null,
  ...overrides,
});

const buildSharingRule = (
  overrides: Partial<{
    universalIdentifier: string;
    objectMetadataUniversalIdentifier: string;
    granteePrincipalType: RecordSharePrincipalType;
    isActive: boolean;
    deletedAt: string | null;
    rowLevelPermissionPredicateUniversalIdentifiers: string[];
  }> = {},
) => ({
  universalIdentifier: EXISTING_RULE_UNIVERSAL_IDENTIFIER,
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  granteePrincipalType: RecordSharePrincipalType.EVERYONE,
  accessLevel: RecordShareAccessLevel.READ,
  isActive: true,
  deletedAt: null,
  rowLevelPermissionPredicateUniversalIdentifiers: [],
  ...overrides,
});

const buildArgs = ({
  updatedFlatObjectMetadata,
  existingFlatObjectMetadata = buildFlatObjectMetadata(),
  existingSharingRules = [],
  createdSharingRules = [],
  deletedSharingRules = [],
  isSystemBuild = false,
}: {
  updatedFlatObjectMetadata: ReturnType<typeof buildFlatObjectMetadata>;
  existingFlatObjectMetadata?: ReturnType<typeof buildFlatObjectMetadata>;
  existingSharingRules?: ReturnType<typeof buildSharingRule>[];
  createdSharingRules?: ReturnType<typeof buildSharingRule>[];
  deletedSharingRules?: ReturnType<typeof buildSharingRule>[];
  isSystemBuild?: boolean;
}): BuildSideEffectsArgs<'objectMetadata'> => {
  const byUniversalIdentifier = (
    sharingRules: ReturnType<typeof buildSharingRule>[],
  ) =>
    Object.fromEntries(
      sharingRules.map((sharingRule) => [
        sharingRule.universalIdentifier,
        sharingRule,
      ]),
    );

  return {
    flatEntity: updatedFlatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName: {
      objectMetadata: {
        flatEntityToCreate: {},
        flatEntityToUpdate: {
          [updatedFlatObjectMetadata.universalIdentifier]:
            updatedFlatObjectMetadata,
        },
        flatEntityToDelete: {},
      },
      sharingRule: {
        flatEntityToCreate: byUniversalIdentifier(createdSharingRules),
        flatEntityToUpdate: {},
        flatEntityToDelete: byUniversalIdentifier(deletedSharingRules),
      },
    } as unknown as AllFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps: {
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {
          [existingFlatObjectMetadata.universalIdentifier]:
            existingFlatObjectMetadata,
        },
      },
      flatSharingRuleMaps: {
        byUniversalIdentifier: byUniversalIdentifier(existingSharingRules),
      },
    },
    context: {
      buildOptions: {
        isSystemBuild,
        applicationUniversalIdentifier: 'application',
      },
    },
  } as unknown as BuildSideEffectsArgs<'objectMetadata'>;
};

describe('ObjectReadabilityPrivateBackfillOnUpdateSideEffectHandlerService', () => {
  const handler =
    new (ObjectReadabilityPrivateBackfillOnUpdateSideEffectHandlerService as unknown as new () => ObjectReadabilityPrivateBackfillOnUpdateSideEffectHandlerService)();

  const privateUpdate = buildFlatObjectMetadata({
    readability: MetadataReadability.PRIVATE,
  });

  it('refuses a transition to PRIVATE when the object has no sharing rule', () => {
    const result = handler.buildSideEffects(
      buildArgs({ updatedFlatObjectMetadata: privateUpdate }),
    );

    expect(result.status).toBe('fail');
    if (result.status !== 'fail') {
      throw new Error('expected fail');
    }
    expect(result.flatEntityMinimalInformation).toMatchObject({
      universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      nameSingular: 'listing',
    });
    expect(result.errors[0].message).toContain('Listings');
  });

  it('accepts the transition when an active criteria-less rule already exists', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        updatedFlatObjectMetadata: privateUpdate,
        existingSharingRules: [
          buildSharingRule({
            granteePrincipalType: RecordSharePrincipalType.ROLE,
          }),
        ],
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('accepts the transition when the backfill rule is created in the same operation', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        updatedFlatObjectMetadata: privateUpdate,
        createdSharingRules: [
          buildSharingRule({
            universalIdentifier: CREATED_RULE_UNIVERSAL_IDENTIFIER,
          }),
        ],
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('accepts a PRIVATE override on a standard object backed by a rule', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        updatedFlatObjectMetadata: buildFlatObjectMetadata({
          overrides: { readability: MetadataReadability.PRIVATE },
        }),
        existingSharingRules: [buildSharingRule()],
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('ignores updates that do not turn the object PRIVATE', () => {
    expect(
      handler.buildSideEffects(
        buildArgs({
          updatedFlatObjectMetadata: buildFlatObjectMetadata({
            readability: MetadataReadability.INHERITED,
          }),
        }),
      ).status,
    ).toBe('noop');
    expect(
      handler.buildSideEffects(
        buildArgs({
          updatedFlatObjectMetadata: privateUpdate,
          existingFlatObjectMetadata: privateUpdate,
        }),
      ).status,
    ).toBe('noop');
  });

  it('ignores system builds, which carry their own backfill', () => {
    expect(
      handler.buildSideEffects(
        buildArgs({
          updatedFlatObjectMetadata: privateUpdate,
          isSystemBuild: true,
        }),
      ).status,
    ).toBe('noop');
  });

  it('does not count rules with criteria, inactive rules, member rules, other objects or rules deleted here', () => {
    const deletedRule = buildSharingRule();

    const result = handler.buildSideEffects(
      buildArgs({
        updatedFlatObjectMetadata: privateUpdate,
        existingSharingRules: [
          deletedRule,
          buildSharingRule({
            universalIdentifier: 'with-criteria',
            rowLevelPermissionPredicateUniversalIdentifiers: [
              PREDICATE_UNIVERSAL_IDENTIFIER,
            ],
          }),
          buildSharingRule({
            universalIdentifier: 'inactive',
            isActive: false,
          }),
          buildSharingRule({
            universalIdentifier: 'member',
            granteePrincipalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          }),
          buildSharingRule({
            universalIdentifier: 'other-object',
            objectMetadataUniversalIdentifier:
              OTHER_OBJECT_UNIVERSAL_IDENTIFIER,
          }),
        ],
        deletedSharingRules: [deletedRule],
      }),
    );

    expect(result.status).toBe('fail');
  });
});
