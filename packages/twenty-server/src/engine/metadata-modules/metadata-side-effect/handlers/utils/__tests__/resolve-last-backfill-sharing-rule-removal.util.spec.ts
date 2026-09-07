import {
  MetadataReadability,
  RecordSharePrincipalType,
} from 'twenty-shared/types';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { resolveLastBackfillSharingRuleRemoval } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/resolve-last-backfill-sharing-rule-removal.util';

const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const EVERYONE_RULE_UNIVERSAL_IDENTIFIER =
  'c1c2c3c4-c5c6-4000-8000-000000000001';
const ROLE_RULE_UNIVERSAL_IDENTIFIER = 'c1c2c3c4-c5c6-4000-8000-000000000002';
const PREDICATE_UNIVERSAL_IDENTIFIER = 'd1d2d3d4-d5d6-4000-8000-000000000001';

const buildSharingRule = (
  overrides: Partial<{
    universalIdentifier: string;
    granteePrincipalType: RecordSharePrincipalType;
    isActive: boolean;
    rowLevelPermissionPredicateUniversalIdentifiers: string[];
  }> = {},
) => ({
  universalIdentifier: EVERYONE_RULE_UNIVERSAL_IDENTIFIER,
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  granteePrincipalType: RecordSharePrincipalType.EVERYONE,
  isActive: true,
  deletedAt: null,
  rowLevelPermissionPredicateUniversalIdentifiers: [],
  ...overrides,
});

const buildFlatObjectMetadata = (readability: MetadataReadability) => ({
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  labelPlural: 'Listings',
  readability,
  overrides: null,
});

const byUniversalIdentifier = <T extends { universalIdentifier: string }>(
  entities: T[],
) =>
  Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  );

const deleteEveryoneRule = {
  sharingRule: {
    flatEntityToDelete: byUniversalIdentifier([buildSharingRule()]),
  },
};

const resolve = ({
  readability = MetadataReadability.PRIVATE,
  existingSharingRules = [buildSharingRule()],
  operations = {},
}: {
  readability?: MetadataReadability;
  existingSharingRules?: ReturnType<typeof buildSharingRule>[];
  operations?: Record<string, unknown>;
} = {}) =>
  resolveLastBackfillSharingRuleRemoval({
    sharingRuleUniversalIdentifier: EVERYONE_RULE_UNIVERSAL_IDENTIFIER,
    flatObjectMetadataMaps: {
      byUniversalIdentifier: byUniversalIdentifier([
        buildFlatObjectMetadata(readability),
      ]),
    } as unknown as AllFlatEntityMaps['flatObjectMetadataMaps'],
    flatSharingRuleMaps: {
      byUniversalIdentifier: byUniversalIdentifier(existingSharingRules),
    } as unknown as AllFlatEntityMaps['flatSharingRuleMaps'],
    allFlatEntityOperationRecordByMetadataName:
      operations as Partial<AllFlatEntityOperationRecordByMetadataName>,
  });

describe('resolveLastBackfillSharingRuleRemoval', () => {
  it('refuses deleting, deactivating or narrowing the only backfill rule of a private object', () => {
    expect(resolve({ operations: deleteEveryoneRule })).toEqual({
      objectLabelPlural: 'Listings',
    });
    expect(
      resolve({
        operations: {
          sharingRule: {
            flatEntityToUpdate: byUniversalIdentifier([
              buildSharingRule({ isActive: false }),
            ]),
          },
        },
      }),
    ).toBeDefined();
    expect(
      resolve({
        operations: {
          rowLevelPermissionPredicate: {
            flatEntityToCreate: {
              [PREDICATE_UNIVERSAL_IDENTIFIER]: {
                universalIdentifier: PREDICATE_UNIVERSAL_IDENTIFIER,
                sharingRuleUniversalIdentifier:
                  EVERYONE_RULE_UNIVERSAL_IDENTIFIER,
              },
            },
          },
        },
      }),
    ).toBeDefined();
  });

  it('accepts the removal when another backfill rule remains or is created alongside', () => {
    expect(
      resolve({
        existingSharingRules: [
          buildSharingRule(),
          buildSharingRule({
            universalIdentifier: ROLE_RULE_UNIVERSAL_IDENTIFIER,
            granteePrincipalType: RecordSharePrincipalType.ROLE,
          }),
        ],
        operations: deleteEveryoneRule,
      }),
    ).toBeUndefined();
    expect(
      resolve({
        operations: {
          sharingRule: {
            ...deleteEveryoneRule.sharingRule,
            flatEntityToCreate: byUniversalIdentifier([
              buildSharingRule({
                universalIdentifier: ROLE_RULE_UNIVERSAL_IDENTIFIER,
                granteePrincipalType: RecordSharePrincipalType.ROLE,
              }),
            ]),
          },
        },
      }),
    ).toBeUndefined();
  });

  it('accepts the removal when the object leaves PRIVATE alongside, is not private, or never had a backfill rule', () => {
    expect(
      resolve({
        operations: {
          ...deleteEveryoneRule,
          objectMetadata: {
            flatEntityToUpdate: byUniversalIdentifier([
              buildFlatObjectMetadata(MetadataReadability.OPEN),
            ]),
          },
        },
      }),
    ).toBeUndefined();
    expect(
      resolve({
        readability: MetadataReadability.OPEN,
        operations: deleteEveryoneRule,
      }),
    ).toBeUndefined();

    const criteriaRule = buildSharingRule({
      rowLevelPermissionPredicateUniversalIdentifiers: [
        PREDICATE_UNIVERSAL_IDENTIFIER,
      ],
    });

    expect(
      resolve({
        existingSharingRules: [criteriaRule],
        operations: {
          sharingRule: {
            flatEntityToDelete: byUniversalIdentifier([criteriaRule]),
          },
        },
      }),
    ).toBeUndefined();
  });
});
